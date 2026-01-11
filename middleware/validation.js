const { body, validationResult, param } = require('express-validator');

/**
 * Validation middleware for contact information
 */
const validateContact = [
  body('contact.firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('contact.lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('contact.address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('contact.city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('contact.email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required'),
  body('products')
    .isArray().withMessage('Products must be an array')
    .notEmpty().withMessage('Products array cannot be empty'),
  body('products.*')
    .isMongoId().withMessage('Each product must be a valid ID')
];

/**
 * Validation middleware for MongoDB ID parameter
 */
const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid product ID')
];

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateContact,
  validateMongoId,
  handleValidationErrors
};
