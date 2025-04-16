const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { User, Role, Company, Consumer } = require('../models');

// Debug check
console.log('User controller methods:', Object.keys(userController));
console.log('getAllUsers type:', typeof userController.getAllUsers);

// Password management routes (public)
router.post('/forgot-password', userController.forgotPassword);
router.get('/reset-password/:token', userController.getResetPasswordForm);
router.post('/reset-password/:token', userController.resetPassword);

// Protected routes with authentication
router.get('/', auth, userController.getAllUsers);

// Get current user info (must be before /:userId routes)
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user from database with role information
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'email', 'username', 'role_id'],
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a company or consumer profile
    let companyInfo = null;
    let consumerInfo = null;

    if (user.Role.role_name === 'company') {
      companyInfo = await Company.findOne({ 
        where: { user_id: userId },
        attributes: ['company_id', 'company_name', 'owner_name', 'company_email', 'contact_number']
      });
    } else if (user.Role.role_name === 'consumer') {
      consumerInfo = await Consumer.findOne({ 
        where: { user_id: userId },
        attributes: ['consumer_id', 'name', 'email', 'phone_number']
      });
    }

    res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role_id: user.role_id,
        role_name: user.Role.role_name,
        profile: companyInfo || consumerInfo
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Error getting user information' });
  }
});

// Other user routes
router.get('/:userId', auth, userController.getUserById);
router.post('/', auth, userController.createUser);
router.put('/:userId', auth, userController.updateUser);
router.delete('/:userId', auth, userController.deleteUser);
router.post('/:userId/profile-image', auth, userController.updateProfileImage);
router.get('/:userId/permissions', auth, userController.getUserPermissions);

// Change password (requires authentication)
router.post('/change-password', auth, userController.changePassword);

module.exports = router;