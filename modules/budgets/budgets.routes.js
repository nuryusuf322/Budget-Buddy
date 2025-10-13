const express = require('express');
const { validationResult } = require('express-validator');

const {
  getAllBudgets,
  getBudgetById,
  addNewBudget,
  updateExistingBudget,
  deleteBudget
} = require('./budgets.model');

const {
  createBudgetValidation,
  updateBudgetValidation,
  budgetIdValidation
} = require('./budgets.middleware');

const router = express.Router();

// GET /api/budgets - Get all budgets
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const budgets = await getAllBudgets(filters);
    
    res.status(200).json({
      success: true,
      data: budgets,
      count: budgets.length
    });
  } catch (error) {
    console.error('Error getting budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get budgets'
    });
  }
});

// GET /api/budgets/:id - Get budget by ID
router.get('/:id', budgetIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const budget = await getBudgetById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Error getting budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get budget'
    });
  }
});

// POST /api/budgets - Create new budget
router.post('/', createBudgetValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const newBudget = await addNewBudget(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: newBudget
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create budget'
    });
  }
});

// PUT /api/budgets/:id - Update budget
router.put('/:id', updateBudgetValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updatedBudget = await updateExistingBudget(req.params.id, req.body);
    
    if (!updatedBudget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: updatedBudget
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget'
    });
  }
});

// DELETE /api/budgets/:id - Delete budget
router.delete('/:id', budgetIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const deletedBudget = await deleteBudget(req.params.id);
    
    if (!deletedBudget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
      data: deletedBudget
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete budget'
    });
  }
});

module.exports = router;