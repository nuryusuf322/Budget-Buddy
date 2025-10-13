const express = require('express');
const { validationResult } = require('express-validator');

const {
  getAllGoals,
  getGoalById,
  addNewGoal,
  updateExistingGoal,
  deleteGoal
} = require('./goals.model');

const {
  createGoalValidation,
  updateGoalValidation,
  goalIdValidation
} = require('./goals.middleware');

const router = express.Router();

// GET /api/goals - Get all goals
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const goals = await getAllGoals(filters);
    
    res.status(200).json({
      success: true,
      data: goals,
      count: goals.length
    });
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get goals'
    });
  }
});

// GET /api/goals/:id - Get goal by ID
router.get('/:id', goalIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const goal = await getGoalById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error getting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get goal'
    });
  }
});

// POST /api/goals - Create new goal
router.post('/', createGoalValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const newGoal = await addNewGoal(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: newGoal
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal'
    });
  }
});

// PUT /api/goals/:id - Update goal
router.put('/:id', updateGoalValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updatedGoal = await updateExistingGoal(req.params.id, req.body);
    
    if (!updatedGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: updatedGoal
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal'
    });
  }
});

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', goalIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const deletedGoal = await deleteGoal(req.params.id);
    
    if (!deletedGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: deletedGoal
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal'
    });
  }
});

module.exports = router;