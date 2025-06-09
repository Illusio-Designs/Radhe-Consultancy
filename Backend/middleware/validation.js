const { body, validationResult } = require('express-validator');

// Validation middleware for regular login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation middleware for Google login
const validateGoogleLogin = [
  body('token')
    .notEmpty()
    .withMessage('Google token is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation middleware for WhatsApp OTP
const validateWhatsAppOTP = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation middleware for OTP verification
const validateOTPVerification = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .matches(/^[0-9]{6}$/)
    .withMessage('Please enter a valid 6-digit OTP'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateLogin,
  validateGoogleLogin,
  validateWhatsAppOTP,
  validateOTPVerification
};