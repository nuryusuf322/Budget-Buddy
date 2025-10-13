const { body, param } = require('express-validator');

// Validation for user registration
const registerValidation = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 letters (e.g., USD)'),
  
  body('monthly_income')
    .optional()
    .isFloat({ min: 0 }).withMessage('Monthly income must be positive')
];

// Validation for user login
const loginValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Validation for updating profile
const updateProfileValidation = [
  param('id').notEmpty().withMessage('User ID is required'),
  
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 letters'),
  
  body('monthly_income')
    .optional()
    .isFloat({ min: 0 }).withMessage('Monthly income must be positive'),
  
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Validation for user ID parameter
const userIdValidation = [
  param('id').notEmpty().withMessage('User ID is required')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  userIdValidation
};