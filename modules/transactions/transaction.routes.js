const express = require('express');
const { validationResult } = require('express-validator');

const {
  getAllTransactions,
  getTransactionById,
  addNewTransaction,
  updateExistingTransaction,
  deleteTransaction
} = require('./transaction.model');

const {
  createTransactionValidation,
  updateTransactionValidation,
  transactionIdValidation
} = require('./transaction.validation');

const router = express.Router();

// GET /api/transactions - Get all transactions
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const transactions = await getAllTransactions(filters);
    
    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
});

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', transactionIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const transaction = await getTransactionById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction'
    });
  }
});

// POST /api/transactions - Create new transaction
router.post('/', createTransactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const newTransaction = await addNewTransaction(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', updateTransactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updatedTransaction = await updateExistingTransaction(req.params.id, req.body);
    
    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction'
    });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', transactionIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const deletedTransaction = await deleteTransaction(req.params.id);
    
    if (!deletedTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: deletedTransaction
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction'
    });
  }
});

module.exports = router;