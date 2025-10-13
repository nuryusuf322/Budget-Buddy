const { body, param } = require('express-validator');

const createCategoryValidation = [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('name').notEmpty().withMessage('Category name is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color'),
  body('icon').optional().isLength({ max: 50 }),
  body('monthly_limit').optional().isFloat({ min: 0 })
];

const updateCategoryValidation = [
  param('id').notEmpty().withMessage('Category ID is required'),
  body('name').optional().notEmpty(),
  body('type').optional().isIn(['income', 'expense']),
  body('color').optional().isHexColor(),
  body('monthly_limit').optional().isFloat({ min: 0 })
];

const categoryIdValidation = [
  param('id').notEmpty().withMessage('Category ID is required')
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
  categoryIdValidation
};