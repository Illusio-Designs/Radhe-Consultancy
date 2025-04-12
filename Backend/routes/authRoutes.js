const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Login route
router.post('/login', authController.login);

// Register route
router.post('/register', authController.register);

// Universal Google login route for all user types
router.post('/google-login', authController.googleLogin);

module.exports = router;