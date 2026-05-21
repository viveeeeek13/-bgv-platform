// src/middleware/validate.js
// Validation middleware using express-validator

const { validationResult } = require('express-validator');

/**
 * Runs after validation chains and returns 400 if any errors exist
 * Usage: router.post('/route', validationChain, validate, handler)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
