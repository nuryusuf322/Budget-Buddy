const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('./transaction.model');
const Budget = require('../budgets/budgets.model');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../../shared/middlewares/auth');

const router = express.Router();

// Protected route - requires authentication
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      search,
      type,
      category,
      startDate,
      endDate,
      user_id
    } = req.query;

    const filter = {};
    // Users can only see their own transactions, admins/managers can see all
    if (['admin', 'manager'].includes(req.user.role)) {
      if (user_id) filter.user_id = user_id;
    } else {
      filter.user_id = req.user.user_id; // Regular users can only see their own
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

// Protected route - requires authentication
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transaction_id: req.params.id });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Users can only access their own transactions, admins/managers can access any
    if (!['admin', 'manager'].includes(req.user.role) && transaction.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own transactions.'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
});

// Protected route - requires authentication
router.post('/', authenticate, [
  body('amount').isNumeric(),
  body('type').isIn(['income', 'expense']),
  body('category').notEmpty(),
  body('date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Parse date string to avoid timezone issues
    // If date is in YYYY-MM-DD format, create a UTC date at midnight for that date
    let transactionDate = req.body.date;
    if (typeof transactionDate === 'string' && transactionDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Create UTC midnight for the specified date to avoid timezone shifts
      // This ensures Dec 3, 2025 stays as Dec 3, 2025 regardless of server timezone
      transactionDate = new Date(transactionDate + 'T00:00:00.000Z');
    } else if (typeof transactionDate === 'string') {
      transactionDate = new Date(transactionDate);
    }

    const transactionData = {
      ...req.body,
      date: transactionDate,
      user_id: req.user.user_id, // Set from authenticated user
      transaction_id: uuidv4()
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    // Update budget if it's an expense
    let budgetWarning = null;
    if (transactionData.type === 'expense') {
      const transactionDate = new Date(transactionData.date);
      const monthYear = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Find budget for this category and month (case-insensitive category matching)
      const budget = await Budget.findOne({
        user_id: req.user.user_id,
        category: { $regex: new RegExp(`^${transactionData.category}$`, 'i') },
        month_year: monthYear
      });

      if (budget) {
        // Recalculate current_spent from all transactions for accuracy
        const [year, month] = monthYear.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        const expenses = await Transaction.find({
          user_id: req.user.user_id,
          category: { $regex: new RegExp(`^${transactionData.category}$`, 'i') },
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        });

        const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
        budget.current_spent = totalSpent;
        await budget.save();

        // Check if limit is exceeded
        if (budget.current_spent > budget.monthly_limit) {
          const exceededBy = budget.current_spent - budget.monthly_limit;
          budgetWarning = {
            category: budget.category,
            monthly_limit: budget.monthly_limit,
            current_spent: budget.current_spent,
            exceeded_by: exceededBy,
            percentage: Math.round((budget.current_spent / budget.monthly_limit) * 100)
          };
        }
      } else {
      }
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
      budgetWarning: budgetWarning
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
});

// Protected route - requires authentication
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existingTransaction = await Transaction.findOne({ transaction_id: req.params.id });
    
    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Users can only update their own transactions, admins/managers can update any
    if (!['admin', 'manager'].includes(req.user.role) && existingTransaction.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own transactions.'
      });
    }

    // Prevent users from changing user_id
    const updateData = { ...req.body };
    if (!['admin', 'manager'].includes(req.user.role)) {
      delete updateData.user_id;
    }

    // Parse date string to avoid timezone issues
    if (updateData.date) {
      if (typeof updateData.date === 'string' && updateData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Create UTC midnight for the specified date to avoid timezone shifts
        updateData.date = new Date(updateData.date + 'T00:00:00.000Z');
      } else if (typeof updateData.date === 'string') {
        updateData.date = new Date(updateData.date);
      }
    }

    const transaction = await Transaction.findOneAndUpdate(
      { transaction_id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    // Update budgets if transaction type is expense
    if (transaction.type === 'expense') {
      const transactionDate = new Date(transaction.date);
      const monthYear = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Update category budget
      const budget = await Budget.findOne({
        user_id: req.user.user_id,
        category: { $regex: new RegExp(`^${transaction.category}$`, 'i') },
        month_year: monthYear
      });

      if (budget) {
        const [year, month] = monthYear.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        const expenses = await Transaction.find({
          user_id: req.user.user_id,
          category: { $regex: new RegExp(`^${transaction.category}$`, 'i') },
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        });

        const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
        budget.current_spent = totalSpent;
        await budget.save();
      }

      // Update monthly budget
      const MonthlyBudget = require('../budgets/monthlyBudget.model');
      const monthlyBudget = await MonthlyBudget.findOne({
        user_id: req.user.user_id,
        month_year: monthYear
      });

      if (monthlyBudget) {
        const [year, month] = monthYear.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        const allExpenses = await Transaction.find({
          user_id: req.user.user_id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        });

        const totalMonthlySpent = allExpenses.reduce((sum, t) => sum + t.amount, 0);
        monthlyBudget.current_spent = totalMonthlySpent;
        await monthlyBudget.save();
      }
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
});

// Protected route - requires authentication
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      transaction_id: req.params.id 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Users can only delete their own transactions, admins/managers can delete any
    if (!['admin', 'manager'].includes(req.user.role) && transaction.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own transactions.'
      });
    }

    // Store transaction data before deletion for budget update
    const transactionType = transaction.type;
    const transactionCategory = transaction.category;
    const transactionDate = transaction.date;

    await Transaction.findOneAndDelete({ transaction_id: req.params.id });

    // Update budget if it was an expense
    if (transactionType === 'expense') {
      const monthYear = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Find budget for this category and month (case-insensitive)
      const budget = await Budget.findOne({
        user_id: req.user.user_id,
        category: { $regex: new RegExp(`^${transactionCategory}$`, 'i') },
        month_year: monthYear
      });

      if (budget) {
        // Recalculate current_spent from all remaining transactions
        const [year, month] = monthYear.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        const expenses = await Transaction.find({
          user_id: req.user.user_id,
          category: { $regex: new RegExp(`^${transactionCategory}$`, 'i') },
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        });

        const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
        budget.current_spent = totalSpent;
        await budget.save();
      }

      // Update monthly budget if it exists
      const MonthlyBudget = require('../budgets/monthlyBudget.model');
      // monthYear is already declared above, reuse it
      
      const monthlyBudget = await MonthlyBudget.findOne({
        user_id: req.user.user_id,
        month_year: monthYear
      });

      if (monthlyBudget) {
        // Recalculate total spending for the month
        const [year, month] = monthYear.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        const allExpenses = await Transaction.find({
          user_id: req.user.user_id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        });

        const totalMonthlySpent = allExpenses.reduce((sum, t) => sum + t.amount, 0);
        monthlyBudget.current_spent = totalMonthlySpent;
        await monthlyBudget.save();
      }
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
});

module.exports = router;