const { body, param } = require('express-validator');

const createTransactionValidation = [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').optional().isLength({ max: 200 })
];

const updateTransactionValidation = [
  param('id').notEmpty().withMessage('Transaction ID is required'),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('type').optional().isIn(['income', 'expense']),
  body('category').optional().notEmpty()
];

const transactionIdValidation = [
  param('id').notEmpty().withMessage('Transaction ID is required')
];

module.exports = {
  createTransactionValidation,
  updateTransactionValidation,
  transactionIdValidation
};