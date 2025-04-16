const userService = require('../services/userService');
const { User, Role, Company, Consumer } = require('../models');
const { uploadAndCompress } = require('../config/multerConfig');
const { Op } = require('sequelize');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get company users
const getCompanyUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role,
        where: { role_name: 'company' },
        attributes: ['role_name']
      }]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get consumer users
const getConsumerUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role,
        where: { role_name: 'consumer' },
        attributes: ['role_name']
      }]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get other users (not company or consumer)
const getOtherUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role,
        where: {
          role_name: {
            [Op.notIn]: ['company', 'consumer']
          }
        },
        attributes: ['role_name']
      }]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;
    const user = await User.create({
      username,
      email,
      password,
      role_id
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update(req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
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
  getCompanyUsers,
  getConsumerUsers,
  getOtherUsers,
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