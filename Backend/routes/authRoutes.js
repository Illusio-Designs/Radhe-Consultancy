const express = require('express');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', authController.login);

// Register route
router.post('/register', authController.register);

// Universal Google login route
router.post('/google-login', authController.googleLogin);

// Get current user route
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;