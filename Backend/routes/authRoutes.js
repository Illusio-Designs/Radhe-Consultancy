const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Regular login
router.post('/login', authController.login);

// Google login
router.post('/google-login', authController.googleLogin);

// Register new user
router.post('/register', authController.register);

module.exports = router; 