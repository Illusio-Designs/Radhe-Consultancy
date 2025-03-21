const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Adjust the path as necessary

// Route to register a new user
router.post('/register', userController.registerUser);

// Route to login user and return JWT
router.post('/login', userController.loginUser);

// Route to request a password reset
router.post('/forgot-password', userController.forgotPassword);

// Route to reset password (for POST requests)
router.post('/reset-password/:token', userController.resetPassword);

// Route to reset password (for GET requests, optional for testing)
router.get('/reset-password/:token', userController.resetPassword);

module.exports = router;
