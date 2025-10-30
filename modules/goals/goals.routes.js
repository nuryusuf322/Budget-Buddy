const express = require('express');
const {body, validationResult} = require('express-validator');
const Goal = require('./goals.model');
const {v4: uuidv4} = require('uuid');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'target_date',
      sortOrder = 'asc',
      search,
      user_id,
    } = req.query;
    
    const filter = {};
    if (user_id) filter.user_id = user_id;
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

router.get('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOne({ goal_id: req.params.id });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
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

router.post('/',[
  body('user_id').notEmpty().withMessage('User ID is required'),
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

router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { goal_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

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

router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ goal_id: req.params.id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }
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