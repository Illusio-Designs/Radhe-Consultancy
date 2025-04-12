const authService = require('../services/authService');
const { User, UserType } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Find Office user type
      const officeType = await UserType.findOne({ where: { type_name: 'Office' } });
      if (!officeType) {
        return res.status(500).json({ error: 'Office user type not found' });
      }

      // Create user with Office type
      const user = await User.create({
        username,
        email,
        password,
        user_type_id: officeType.user_type_id,
        role_id: 2 // Default to User role
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async googleLogin(req, res) {
    try {
      const { token, userType } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Google token is required' });
      }

      if (!userType) {
        return res.status(400).json({ error: 'User type is required' });
      }

      const result = await authService.googleLogin(token, userType);

      // Response based on user type
      if (userType === 'vendor') {
        res.json({
          token: result.token,
          vendor: {
            vendor_id: result.user.vendor_id,
            email: result.user.email,
            name: result.user.name,
            profile_image: result.user.profile_image,
            vendor_type: result.user.vendor_type,
            status: result.user.status
          },
          userType: 'vendor'
        });
      } else {
        res.json({
          token: result.token,
          user: {
            user_id: result.user.user_id,
            email: result.user.email,
            username: result.user.username,
            role_id: result.user.role_id,
            user_type: result.user.UserType?.type_name,
            profile_image: result.user.profile_image
          },
          userType: 'office'
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  // Remove the separate vendorGoogleLogin method as it's now handled in the main googleLogin
}

module.exports = new AuthController();