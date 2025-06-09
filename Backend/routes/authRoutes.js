const express = require('express');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { 
  validateLogin, 
  validateGoogleLogin, 
  validateWhatsAppOTP, 
  validateOTPVerification 
} = require('../middleware/validation');

const router = express.Router();

// Login route
router.post('/login', validateLogin, authController.login);

// Register route
router.post('/register', authController.register);

// Google OAuth login
router.post('/google', validateGoogleLogin, authController.googleLogin);

// WhatsApp OTP login
router.post('/whatsapp/send-otp', validateWhatsAppOTP, authController.sendWhatsAppOTP);
router.post('/whatsapp/verify-otp', validateOTPVerification, authController.verifyWhatsAppOTP);

// Forgot password route
router.post('/forgot-password', authController.forgotPassword);

// Reset password route
router.post('/reset-password/:token', authController.resetPassword);

// Get current user route
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;