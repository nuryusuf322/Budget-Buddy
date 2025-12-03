const express = require('express');
const {body, validationResult} = require('express-validator');
const Goal = require('./goals.model');
const {v4: uuidv4} = require('uuid');
const { authenticate, authorize } = require('../../shared/middlewares/auth');

const router = express.Router();

// Protected route - requires authentication
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'target_date',
      sortOrder = 'asc',
      search,
      user_id,
      priority,
    } = req.query;
    
    const filter = {};
    // Users can only see their own goals, admins/managers can see all
    if (['admin', 'manager'].includes(req.user.role)) {
      if (user_id) filter.user_id = user_id;
    } else {
      filter.user_id = req.user.user_id; // Regular users can only see their own
    }
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { goal_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const goals = await Goal.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Goal.countDocuments(filter);

    res.json({
      success: true,
      data: goals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching goals',
      error: error.message,
    });
  }
});

// Protected route - requires authentication
router.get('/:id', authenticate, async (req, res) => {
  try {
    const goal = await Goal.findOne({ goal_id: req.params.id });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Users can only access their own goals, admins/managers can access any
    if (!['admin', 'manager'].includes(req.user.role) && goal.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own goals.'
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching goal',
      error: error.message,
    });
  }
});

// Protected route - requires authentication
router.post('/', authenticate, [
  body('goal_name').notEmpty().withMessage('Goal name is required'),
  body('target_amount').isFloat({ gt: 0 }).withMessage('Target amount must be greater than 0'),
  body('target_date').isISO8601().withMessage('Target date must be a valid date'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const goalData = {
      ...req.body,
      user_id: req.user.user_id, // Set from authenticated user
      goal_id: uuidv4(),
    };

    const goal = new Goal(goalData);

    await goal.save();
    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating goal',
      error: error.message,
    });
  }
});

// Protected route - requires authentication
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existingGoal = await Goal.findOne({ goal_id: req.params.id });
    
    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Users can only update their own goals, admins/managers can update any
    if (!['admin', 'manager'].includes(req.user.role) && existingGoal.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own goals.'
      });
    }

    // Prevent users from changing user_id
    const updateData = { ...req.body };
    if (!['admin', 'manager'].includes(req.user.role)) {
      delete updateData.user_id;
    }

    const goal = await Goal.findOneAndUpdate(
      { goal_id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating goal',
      error: error.message,
    });
  }
});

// Protected route - requires authentication
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const goal = await Goal.findOne({ goal_id: req.params.id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Users can only delete their own goals, admins/managers can delete any
    if (!['admin', 'manager'].includes(req.user.role) && goal.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own goals.'
      });
    }

    await Goal.findOneAndDelete({ goal_id: req.params.id });
    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting goal',
      error: error.message,
    });
  }
});

module.exports = router;