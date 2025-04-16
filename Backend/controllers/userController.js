const userService = require('../services/userService');
const { User, Role, Vendor } = require('../models');
const { uploadAndCompress } = require('../config/multerConfig');
const { Op } = require('sequelize');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Create new user
const createUser = async (req, res) => {
  const { username, email, password, role_id } = req.body;

  // Check if the role_id is valid
  const role = await Role.findByPk(role_id);
  if (!role) {
    return res.status(400).json({ error: 'Role not found' });
  }

  // Proceed with user creation logic
  try {
    const newUser = await userService.createUser({
      username,
      email,
      password,
      role_id
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.username || !req.body.email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    // Validate role if provided
    if (req.body.role_id) {
      const role = await Role.findByPk(req.body.role_id);
      if (!role) {
        return res.status(400).json({ error: 'Role not found' });
      }
    }

    const updatedUser = await userService.updateUser(req.params.userId, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.userId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update profile image
const updateProfileImage = async (req, res) => {
  try {
    uploadAndCompress('image')(req, res, async () => {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      const user = await userService.updateProfileImage(userId, req.file);
      res.json(user);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user permissions
const getUserPermissions = async (req, res) => {
  try {
    const permissions = await userService.getUserPermissions(req.params.userId);
    res.json(permissions);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const result = await userService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const result = await userService.resetPassword(token, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user.userId, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Reset Password Form
const getResetPasswordForm = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get current user information
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user from database
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

    // If user is a vendor, get vendor information
    let vendorInfo = null;
    if (user.role_id === 3) { // Assuming 3 is the vendor role ID
      vendorInfo = await Vendor.findOne({ where: { user_id: userId } });
    }

    res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role_id: user.role_id,
        role_name: user.Role.role_name,
        vendorInfo
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Error getting user information' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfileImage,
  getUserPermissions,
  forgotPassword,
  resetPassword,
  changePassword,
  getResetPasswordForm,
  getCurrentUser
};