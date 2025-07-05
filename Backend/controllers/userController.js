const User = require('../models/userModel');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const userService = require('../services/userService');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['role_name'],
        through: { attributes: ['is_primary'] }
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
        as: 'roles',
        where: { role_name: 'Company' },
        attributes: ['role_name'],
        through: { attributes: ['is_primary'] }
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
        as: 'roles',
        where: { role_name: 'Consumer' },
        attributes: ['role_name'],
        through: { attributes: ['is_primary'] }
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
        as: 'roles',
        where: {
          role_name: {
            [Op.notIn]: ['Company', 'Consumer']
          }
        },
        attributes: ['role_name'],
        through: { attributes: ['is_primary'] }
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
        as: 'roles',
        attributes: ['role_name'],
        through: { attributes: ['is_primary'] },
        include: [{
          model: Permission,
          through: { attributes: [] },
          attributes: ['permission_name']
        }]
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get primary role or first role
    const primaryRole = user.roles.find(role => role.UserRole?.is_primary) || user.roles[0];
    const roleName = primaryRole ? primaryRole.role_name : 'User';

    res.json({
      id: user.user_id,
      email: user.email,
      username: user.username,
      contact_number: user.contact_number,
      imageUrl: user.profile_image,
      role: roleName,
      roles: user.roles.map(r => r.role_name),
      permissions: primaryRole?.Permissions?.map(p => p.permission_name) || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
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

    const updateData = { ...req.body };
    await userService.updateUser(user.user_id, updateData);

    // Get updated user with role information and permissions
    const updatedUser = await User.findOne({
      where: { user_id: user.user_id },
      attributes: ['user_id', 'email', 'username', 'contact_number', 'profile_image'],
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['role_name'],
        through: { attributes: ['is_primary'] },
        include: [{
          model: Permission,
          through: { attributes: [] },
          attributes: ['permission_name']
        }]
      }]
    });

    // Get primary role or first role
    const primaryRole = updatedUser.roles.find(role => role.UserRole?.is_primary) || updatedUser.roles[0];
    const roleName = primaryRole ? primaryRole.role_name : 'User';

    res.json({
      id: updatedUser.user_id,
      email: updatedUser.email,
      username: updatedUser.username,
      contact_number: updatedUser.contact_number,
      imageUrl: updatedUser.profile_image,
      role: roleName,
      roles: updatedUser.roles.map(r => r.role_name),
      permissions: primaryRole?.Permissions?.map(p => p.permission_name) || []
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
    const permissions = await userService.getUserPermissions(req.params.id);
    res.json(permissions);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Accept both 'oldPassword' and 'currentPassword' for compatibility
    const oldPassword = req.body.oldPassword || req.body.currentPassword;
    const { newPassword } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const isMatch = await user.validatePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Old password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get current user information
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user from database with role and permissions
    const user = await User.findOne({
      where: { user_id: userId },
      attributes: ['user_id', 'email', 'username', 'contact_number', 'profile_image'],
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['role_name'],
        through: { attributes: ['is_primary'] },
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

    // Get primary role or first role
    const primaryRole = user.roles.find(role => role.UserRole?.is_primary) || user.roles[0];
    const roleName = primaryRole ? primaryRole.role_name : 'User';

    // Get role-specific data
    let additionalData = {};
    if (roleName === 'Company') {
      const companyData = await Company.findOne({
        where: { user_id: userId }
      });
      additionalData = { company: companyData };
    } else if (roleName === 'Consumer') {
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
      role: roleName,
      roles: user.roles.map(r => r.role_name),
      permissions: primaryRole?.Permissions?.map(p => p.permission_name) || [],
      ...additionalData
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Error getting user information' });
  }
};

// Search users by username, email, or contact_number
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('username')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('contact_number')), 'LIKE', `%${q.toLowerCase()}%`)
        ]
      },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['role_name'],
        through: { attributes: ['is_primary'] }
      }]
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  changePassword,
  searchUsers
};