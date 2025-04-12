const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Debug check
console.log('User controller methods:', Object.keys(userController));
console.log('getAllUsers type:', typeof userController.getAllUsers);

// Password management routes (public)
router.post('/forgot-password', userController.forgotPassword);
router.get('/reset-password/:token', userController.getResetPasswordForm);
router.post('/reset-password/:token', userController.resetPassword);

// Protected routes with authentication
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:userId', authenticateToken, userController.getUserById);
router.post('/', authenticateToken, userController.createUser);
router.put('/:userId', authenticateToken, userController.updateUser);
router.delete('/:userId', authenticateToken, userController.deleteUser);
router.post('/:userId/profile-image', authenticateToken, userController.updateProfileImage);
router.get('/:userId/permissions', authenticateToken, userController.getUserPermissions);

// Change password (requires authentication)
router.post('/change-password', authenticateToken, userController.changePassword);

module.exports = router;