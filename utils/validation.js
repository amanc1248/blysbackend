const { body, query, validationResult } = require('express-validator');

/**
 * Validation Rules for User Registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

/**
 * Validation Rules for User Login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation Rules for Task Creation/Update
 */
const taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD)')
    .toDate()
];

/**
 * Validation Rules for Pagination and Sorting Query Parameters
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['end_date', 'priority', 'created_at'])
    .withMessage('SortBy must be end_date, priority, or created_at'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc')
];

/**
 * Middleware to handle validation errors
 * Returns 400 with detailed error messages if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  taskValidation,
  paginationValidation,
  validate
};

