const { body, param } = require('express-validator');

const createBudgetValidation = [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('monthly_limit').isFloat({ min: 0.01 }).withMessage('Monthly limit must be a positive number'),
  body('month_year').matches(/^(0[1-9]|1[0-2])-20\d{2}$/).withMessage('Month year must be in MM-YYYY format'),
  body('current_spent').optional().isFloat({ min: 0 })
];

const updateBudgetValidation = [
  param('id').notEmpty().withMessage('Budget ID is required'),
  body('monthly_limit').optional().isFloat({ min: 0.01 }),
  body('current_spent').optional().isFloat({ min: 0 }),
  body('category').optional().notEmpty()
];

const budgetIdValidation = [
  param('id').notEmpty().withMessage('Budget ID is required')
];

module.exports = {
  createBudgetValidation,
  updateBudgetValidation,
  budgetIdValidation
};