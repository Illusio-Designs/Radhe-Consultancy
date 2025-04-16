const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Debug check
console.log('User controller methods:', Object.keys(userController));
console.log('getAllUsers type:', typeof userController.getAllUsers);

// Password management routes (public)
router.post('/forgot-password', userController.forgotPassword);
router.get('/reset-password/:token', userController.getResetPasswordForm);
router.post('/reset-password/:token', userController.resetPassword);

// Protected routes with authentication
router.get('/', auth, userController.getAllUsers);
router.get('/:userId', auth, userController.getUserById);
router.post('/', auth, userController.createUser);
router.put('/:userId', auth, userController.updateUser);
router.delete('/:userId', auth, userController.deleteUser);
router.post('/:userId/profile-image', auth, userController.updateProfileImage);
router.get('/:userId/permissions', auth, userController.getUserPermissions);

// Change password (requires authentication)
router.post('/change-password', auth, userController.changePassword);

module.exports = router;