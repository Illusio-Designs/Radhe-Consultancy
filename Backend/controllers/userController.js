const userService = require('../services/userService');
const { User, Role, Company, Consumer, Permission } = require('../models');
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
    const userId = req.params.userId;
    
    // Try to find user by user_id first
    let user = await User.findOne({
      where: { user_id: userId },
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });

    // If not found by user_id, try by numeric ID
    if (!user) {
      user = await User.findByPk(userId, {
        include: [{
          model: Role,
          attributes: ['role_name']
        }]
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format the response
    res.json({
      id: user.user_id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      imageUrl: user.imageUrl,
      role: user.Role.role_name
    });
  } catch (error) {
    console.error('Error getting user:', error);
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
    const userId = req.params.userId;
    const updateData = { ...req.body };

    // Remove sensitive fields that shouldn't be updated here
    delete updateData.password;
    delete updateData.role_id;

    // Handle profile image upload
    if (req.file) {
      updateData.profile_image = `/uploads/profile_images/${req.file.filename}`;
    }

    // Try to find user by user_id first
    let user = await User.findOne({
      where: { user_id: userId }
    });

    // If not found by user_id, try by numeric ID
    if (!user) {
      user = await User.findByPk(userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update(updateData);

    // Get updated user with role information and permissions
    const updatedUser = await User.findOne({
      where: { user_id: user.user_id },
      attributes: ['user_id', 'email', 'username', 'role_id', 'contact_number', 'profile_image'],
      include: [{
        model: Role,
        attributes: ['role_name'],
        include: [{
          model: Permission,
          through: { attributes: [] },
          attributes: ['permission_name']
        }]
      }]
    });

    res.json({
      id: updatedUser.user_id,
      email: updatedUser.email,
      username: updatedUser.username,
      contact_number: updatedUser.contact_number,
      imageUrl: updatedUser.profile_image,
      role: updatedUser.Role.role_name,
      permissions: updatedUser.Role.Permissions?.map(p => p.permission_name) || []
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user information' });
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
    const userId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the imageUrl field
    await user.update({ imageUrl: `/uploads/${file.filename}` });

    res.json({
      message: 'Profile image updated successfully',
      imageUrl: `/uploads/${file.filename}`
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ message: 'Error updating profile image' });
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
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
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
    
    // Get user from database with role and permissions
    const user = await User.findOne({
      where: { user_id: userId },
      attributes: ['user_id', 'email', 'username', 'role_id', 'contact_number', 'profile_image'],
      include: [{
        model: Role,
        attributes: ['role_name'],
        include: [{
          model: Permission,
          through: { attributes: [] },
          attributes: ['permission_name']
        }]
      }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get role-specific data
    let additionalData = {};
    if (user.Role.role_name === 'company') {
      const companyData = await Company.findOne({
        where: { user_id: userId }
      });
      additionalData = { company: companyData };
    } else if (user.Role.role_name === 'consumer') {
      const consumerData = await Consumer.findOne({
        where: { user_id: userId }
      });
      additionalData = { consumer: consumerData };
    }

    // Format the response
    res.json({
      id: user.user_id,
      email: user.email,
      username: user.username,
      phone: user.contact_number,
      imageUrl: user.profile_image,
      role: user.Role.role_name,
      permissions: user.Role.Permissions?.map(p => p.permission_name) || [],
      ...additionalData
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
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfileImage,
  getUserPermissions,
  forgotPassword,
  resetPassword,
  changePassword,
  getResetPasswordForm
};