const userService = require('../services/userService');
const { User, Role } = require('../models');
const { uploadAndCompress } = require('../config/multerConfig');
const { Op } = require('sequelize');

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

// Create new user
async function createUser(req, res) {
  const { username, email, password, role_id } = req.body;

  // Log incoming data for debugging
  console.log('Incoming user data:', req.body);

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
      role_id,
      user_type_id: 1 // Default to Office type
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

// Update user
async function updateUser(req, res) {
  try {
    console.log('Update user request:', {
      userId: req.params.userId,
      body: req.body
    });

    // Validate required fields
    if (!req.body.username || !req.body.email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    // Validate role if provided
    if (req.body.role_id) {
      console.log('Validating role_id:', req.body.role_id);
      const role = await Role.findByPk(req.body.role_id);
      if (!role) {
        console.error('Invalid role_id provided:', req.body.role_id);
        return res.status(400).json({ error: 'Role not found' });
      }
      console.log('Role validation successful:', role.toJSON());
    }

    // Get current user to compare changes
    const currentUser = await User.findByPk(req.params.userId, {
      include: [{ model: Role }]
    });
    console.log('Current user state:', currentUser.toJSON());

    // Update user
    const updatedUser = await userService.updateUser(req.params.userId, req.body);
    console.log('User updated successfully:', updatedUser.toJSON());
    
    // Fetch updated user with role information
    const finalUser = await User.findByPk(req.params.userId, {
      include: [{ model: Role }]
    });
    console.log('Final user state:', finalUser.toJSON());
    
    res.json(finalUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
}

// Delete user
async function deleteUser(req, res) {
  try {
    await userService.deleteUser(req.params.userId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Update profile image
async function updateProfileImage(req, res) {
  try {
    uploadAndCompress('image')(req, res, async () => {
      const userId = req.params.userId;
      console.log('Received userId:', userId);
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      const user = await userService.updateProfileImage(userId, req.file);
      res.json(user);
    });
  } catch (error) {
    console.error('Error in updateProfileImage controller:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get user permissions
async function getUserPermissions(req, res) {
  try {
    const permissions = await userService.getUserPermissions(req.params.userId);
    res.json(permissions);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

// Forgot Password
async function forgotPassword(req, res) {
  try {
    console.log('Received forgot password request:', req.body);
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await userService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

// Reset Password
async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const result = await userService.resetPassword(token, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Change Password
async function changePassword(req, res) {
  try {
    console.log('Change password request body:', req.body);
    console.log('User from token:', req.user);
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user.userId, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(400).json({ error: error.message });
  }
}

// Get Reset Password Form
async function getResetPasswordForm(req, res) {
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
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Error in getResetPasswordForm:', error);
    res.status(500).json({ error: error.message });
  }
}

async function assignRole(req, res) {
  try {
    const { user_id, role_id } = req.body;
    
    // Verify role exists
    const role = await Role.findByPk(role_id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Update user role
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role_id });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

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
  assignRole
};