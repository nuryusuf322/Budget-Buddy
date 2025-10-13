const { body, param } = require('express-validator');

const createGoalValidation = [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('goal_name').notEmpty().withMessage('Goal name is required'),
  body('target_amount').isFloat({ min: 0.01 }).withMessage('Target amount must be a positive number'),
  body('target_date').isISO8601().withMessage('Target date must be a valid date'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('current_amount').optional().isFloat({ min: 0 }),
  body('description').optional().isLength({ max: 500 })
];

const updateGoalValidation = [
  param('id').notEmpty().withMessage('Goal ID is required'),
  body('target_amount').optional().isFloat({ min: 0.01 }),
  body('current_amount').optional().isFloat({ min: 0 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('goal_name').optional().notEmpty()
];

const goalIdValidation = [
  param('id').notEmpty().withMessage('Goal ID is required')
];

module.exports = {
  createGoalValidation,
  updateGoalValidation,
  goalIdValidation
};