const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { User, Role, Company, Consumer } = require('../models');
const { uploadProfile } = require('../config/multerConfig');
const path = require('path');
const fs = require('fs');

// Protected routes with authentication
router.get('/', auth, userController.getAllUsers);

// Get current user info (must be before /:userId routes)
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user from database with role information
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'email', 'username', 'role_id', 'contact_number', 'profile_image'],
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
        contact_number: user.contact_number,
        imageUrl: user.profile_image,
        profile: companyInfo || consumerInfo
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Error getting user information' });
  }
});

// Change password (requires authentication)
router.post('/change-password', auth, userController.changePassword);

// Other user routes
router.get('/:userId', auth, userController.getUserById);
router.post('/', auth, userController.createUser);
router.put('/:userId', auth, uploadProfile.single('profile_image'), userController.updateUser);
router.delete('/:userId', auth, userController.deleteUser);
router.get('/:userId/permissions', auth, userController.getUserPermissions);

// Role-specific user routes
router.get('/company', auth, userController.getCompanyUsers);
router.get('/consumer', auth, userController.getConsumerUsers);
router.get('/other', auth, userController.getOtherUsers);


// Add new route to serve profile images
router.get('/profile-image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/profile_images', filename);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set proper headers for image serving
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send the image file
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error serving profile image:', error);
    res.status(500).json({ error: 'Error serving image' });
  }
});

module.exports = router;