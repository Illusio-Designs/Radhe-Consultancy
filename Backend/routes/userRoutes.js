const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Password management routes (public)
router.post('/forgot-password', userController.forgotPassword);
router.get('/reset-password/:token', userController.getResetPasswordForm);
router.post('/reset-password/:token', userController.resetPassword);

// Apply authentication middleware to protected routes
router.use(authenticateToken);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Update user
router.put('/:userId', userController.updateUser);

// Delete user
router.delete('/:userId', userController.deleteUser);

// Update profile image
router.post('/:userId/profile-image', userController.updateProfileImage);

// Get user permissions
router.get('/:userId/permissions', userController.getUserPermissions);

// Change password (requires authentication)
router.post('/change-password', userController.changePassword);

module.exports = router; 