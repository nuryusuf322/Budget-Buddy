const express = require('express');
const { body, validationResult } = require('express-validator');
const Budget = require('./budgets.model');
const MonthlyBudget = require('./monthlyBudget.model');
const Transaction = require('../transactions/transaction.model');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../../shared/middlewares/auth');

const router = express.Router();

// Protected route - requires authentication
router.get('/', authenticate, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'month_year',
            sortOrder = 'desc',
            search,
            user_id,
            category
        } = req.query;

    const filter = {};
    // Users can only see their own budgets, admins/managers can see all
    if (['admin', 'manager'].includes(req.user.role)) {
      if (user_id) filter.user_id = user_id;
    } else {
      filter.user_id = req.user.user_id; // Regular users can only see their own
    }
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: 'i' } },
        { month_year: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

        const budgets = await Budget.find(filter)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Budget.countDocuments(filter);

        res.json({
            success: true,
            data: budgets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// Protected route - requires authentication
router.post('/', authenticate, [
    body('category').notEmpty().withMessage('category is required'),
    body('monthly_limit').isFloat({ min: 0 }).withMessage('monthly_limit must be a non-negative number'),
    body('month_year').notEmpty().withMessage('month_year is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const budgetData = {
            ...req.body,
            user_id: req.user.user_id, // Set from authenticated user
            budget_id: uuidv4()
        };

        // Calculate current_spent from existing transactions (case-insensitive category matching)
        const [year, month] = budgetData.month_year.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        const expenses = await Transaction.find({
            user_id: req.user.user_id,
            category: { $regex: new RegExp(`^${budgetData.category}$`, 'i') },
            type: 'expense',
            date: { $gte: startDate, $lte: endDate }
        });

        budgetData.current_spent = expenses.reduce((sum, t) => sum + t.amount, 0);

        const budget = new Budget(budgetData);
        await budget.save();
        res.status(201).json({ success: true, message: 'Budget created sucessfully', data: budget });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error creating budget', error: error.message });
    }
});

// Get budget warnings (exceeded limits) - MUST be before /:id routes
router.get('/warnings', authenticate, async (req, res) => {
    try {
        const filter = {};
        // Users can only see their own budgets, admins/managers can see all
        if (['admin', 'manager'].includes(req.user.role)) {
            if (req.query.user_id) filter.user_id = req.query.user_id;
        } else {
            filter.user_id = req.user.user_id;
        }

        const budgets = await Budget.find(filter);
        const warnings = [];

        // Check category budgets
        for (const budget of budgets) {
            // Recalculate current_spent from transactions (case-insensitive category matching)
            const [year, month] = budget.month_year.split('-');
            const startDate = new Date(year, parseInt(month) - 1, 1);
            const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

            const expenses = await Transaction.find({
                user_id: budget.user_id,
                category: { $regex: new RegExp(`^${budget.category}$`, 'i') },
                type: 'expense',
                date: { $gte: startDate, $lte: endDate }
            });

            const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
            
            // Update budget if different
            if (budget.current_spent !== totalSpent) {
                budget.current_spent = totalSpent;
                await budget.save();
            }

            // Check if limit is exceeded
            if (totalSpent > budget.monthly_limit) {
                warnings.push({
                    budget_id: budget.budget_id,
                    category: budget.category,
                    monthly_limit: budget.monthly_limit,
                    current_spent: totalSpent,
                    exceeded_by: totalSpent - budget.monthly_limit,
                    percentage: Math.round((totalSpent / budget.monthly_limit) * 100),
                    month_year: budget.month_year,
                    type: 'category'
                });
            }
        }

        // Check monthly budgets (total spending across all categories)
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const monthlyBudgets = await MonthlyBudget.find({
            user_id: filter.user_id,
            month_year: currentMonth
        });

        for (const monthlyBudget of monthlyBudgets) {
            // Recalculate current_spent from all expense transactions
            const [year, month] = monthlyBudget.month_year.split('-');
            const startDate = new Date(year, parseInt(month) - 1, 1);
            const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

            const allExpenses = await Transaction.find({
                user_id: monthlyBudget.user_id,
                type: 'expense',
                date: { $gte: startDate, $lte: endDate }
            });

            const totalSpent = allExpenses.reduce((sum, t) => sum + t.amount, 0);
            
            // Update monthly budget if different
            if (monthlyBudget.current_spent !== totalSpent) {
                monthlyBudget.current_spent = totalSpent;
                await monthlyBudget.save();
            }

            // Check if monthly limit is exceeded
            if (totalSpent > monthlyBudget.monthly_limit) {
                warnings.push({
                    type: 'monthly',
                    monthly_limit: monthlyBudget.monthly_limit,
                    current_spent: totalSpent,
                    exceeded_by: totalSpent - monthlyBudget.monthly_limit,
                    percentage: Math.round((totalSpent / monthlyBudget.monthly_limit) * 100),
                    month_year: monthlyBudget.month_year
                });
            }
        }

        res.json({
            success: true,
            data: warnings,
            count: warnings.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching budget warnings', error: error.message });
    }
});

// ========== MONTHLY BUDGET ROUTES (Total spending limit for the month) - MUST be before /:id routes ==========

// Get monthly budget for a specific month
router.get('/monthly/:month_year', authenticate, async (req, res) => {
    try {
        const filter = {
            user_id: req.user.user_id,
            month_year: req.params.month_year
        };

        let monthlyBudget = await MonthlyBudget.findOne(filter);

        // Calculate current spending from all expense transactions
        const [year, month] = req.params.month_year.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        const expenses = await Transaction.find({
            user_id: req.user.user_id,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate }
        });

        const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

        // If monthly budget doesn't exist, return null with current spending
        if (!monthlyBudget) {
            return res.json({
                success: true,
                data: null,
                current_spent: totalSpent
            });
        }

        // Update current_spent
        monthlyBudget.current_spent = totalSpent;
        await monthlyBudget.save();

        res.json({
            success: true,
            data: monthlyBudget
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching monthly budget', error: error.message });
    }
});

// Create or update monthly budget
router.post('/monthly', authenticate, [
    body('monthly_limit').isFloat({ min: 0 }).withMessage('monthly_limit must be a non-negative number'),
    body('month_year').notEmpty().withMessage('month_year is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { monthly_limit, month_year } = req.body;

        // Calculate current spending from all expense transactions
        const [year, month] = month_year.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        const expenses = await Transaction.find({
            user_id: req.user.user_id,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate }
        });

        const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

        // Find or create monthly budget
        let monthlyBudget = await MonthlyBudget.findOne({
            user_id: req.user.user_id,
            month_year: month_year
        });

        if (monthlyBudget) {
            // Update existing
            monthlyBudget.monthly_limit = monthly_limit;
            monthlyBudget.current_spent = totalSpent;
            await monthlyBudget.save();
        } else {
            // Create new
            monthlyBudget = new MonthlyBudget({
                monthly_budget_id: uuidv4(),
                user_id: req.user.user_id,
                monthly_limit: monthly_limit,
                current_spent: totalSpent,
                month_year: month_year
            });
            await monthlyBudget.save();
        }

        res.status(201).json({
            success: true,
            message: 'Monthly budget created/updated successfully',
            data: monthlyBudget
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Monthly budget for this month already exists'
            });
        }
        res.status(500).json({ success: false, message: 'Error creating monthly budget', error: error.message });
    }
});

// Delete monthly budget
router.delete('/monthly/:month_year', authenticate, async (req, res) => {
    try {
        const monthlyBudget = await MonthlyBudget.findOne({
            user_id: req.user.user_id,
            month_year: req.params.month_year
        });

        if (!monthlyBudget) {
            return res.status(404).json({ success: false, message: 'Monthly budget not found' });
        }

        await MonthlyBudget.findOneAndDelete({
            user_id: req.user.user_id,
            month_year: req.params.month_year
        });

        res.json({ success: true, message: 'Monthly budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting monthly budget', error: error.message });
    }
});

// Recalculate budget spending from transactions (helper endpoint) - MUST be before /:id routes
router.post('/:id/recalculate', authenticate, async (req, res) => {
    try {
        const budget = await Budget.findOne({ budget_id: req.params.id });
        
        if (!budget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }

        // Users can only recalculate their own budgets, admins/managers can recalculate any
        if (!['admin', 'manager'].includes(req.user.role) && budget.user_id !== req.user.user_id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only recalculate your own budgets.' 
            });
        }

        // Recalculate current_spent from transactions
        const [year, month] = budget.month_year.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        const expenses = await Transaction.find({
            user_id: budget.user_id,
            category: { $regex: new RegExp(`^${budget.category}$`, 'i') },
            type: 'expense',
            date: { $gte: startDate, $lte: endDate }
        });

        const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
        budget.current_spent = totalSpent;
        await budget.save();

        res.json({
            success: true,
            message: 'Budget recalculated successfully',
            data: budget
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error recalculating budget', error: error.message });
    }
});

// Protected route - requires authentication
router.put('/:id', authenticate, async (req, res) => {
    try {
        const existingBudget = await Budget.findOne({ budget_id: req.params.id });
        
        if (!existingBudget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }

        // Users can only update their own budgets, admins/managers can update any
        if (!['admin', 'manager'].includes(req.user.role) && existingBudget.user_id !== req.user.user_id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only update your own budgets.' 
            });
        }

        // Prevent users from changing user_id
        const updateData = { ...req.body };
        if (!['admin', 'manager'].includes(req.user.role)) {
            delete updateData.user_id;
        }

        const budget = await Budget.findOneAndUpdate(
            { budget_id: req.params.id },
            updateData,
            { new: true }
        );

        res.json({ success: true, message: 'Budget updated successfully', data: budget });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating budget', error: error.message });
    }
});

// Protected route - requires authentication
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const budget = await Budget.findOne({ budget_id: req.params.id });
        if (!budget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }

        // Users can only delete their own budgets, admins/managers can delete any
        if (!['admin', 'manager'].includes(req.user.role) && budget.user_id !== req.user.user_id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only delete your own budgets.' 
            });
        }

        await Budget.findOneAndDelete({ budget_id: req.params.id });
        res.json({ success: true, message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting budget', error: error.message });
    }
});


module.exports = router;