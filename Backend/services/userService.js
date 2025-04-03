const { User, Role, RolePermission } = require('../models');
const { processAndSaveImage, deleteFile } = require('../utils/helperFunctions');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const fs = require('fs').promises;
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profile-images');
const ensureUploadsDir = async () => {
    try {
        await fs.mkdir(uploadsDir, { recursive: true });
    } catch (error) {
        console.error('Error creating uploads directory:', error);
        throw error;
    }
};

class UserService {
  // Get all users with their roles
  async getAllUsers() {
    return User.findAll({
      include: [{ model: Role }]
    });
  }

  // Get user by ID
  async getUserById(userId) {
    return User.findByPk(userId, {
      include: [{ model: Role }]
    });
  }

  // Create new user
  async createUser(userData) {
    const role = await Role.findByPk(userData.role_id);
    if (!role) {
      throw new Error('Role not found');
    }

    return User.create(userData);
  }

  // Update user
  async updateUser(userId, userData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (userData.role_id) {
      const role = await Role.findByPk(userData.role_id);
      if (!role) {
        throw new Error('Role not found');
      }
    }

    return user.update(userData);
  }

  // Delete user
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Only try to delete if it's a local file
    if (user.profile_image && !user.profile_image.startsWith('http')) {
      const imagePath = path.join(process.env.UPLOAD_PATH, user.profile_image);
      await deleteFile(imagePath);
    }

    await user.destroy();
  }

  // Update user profile image
  async updateProfileImage(userId, file) {
    try {
      console.log('Updating profile image for user:', userId);
      const user = await User.findByPk(userId);
      if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not found');
      }
      console.log('Found user:', user.toJSON());

      // Ensure uploads directory exists
      await ensureUploadsDir();

      // Save new profile image first
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, file.buffer);
      console.log('New image saved:', fileName);

      // Store old image filename for deletion
      const oldFileName = user.profile_image;

      // Update user profile image with new filename
      user.profile_image = fileName;
      await user.save();
      console.log('User profile image updated successfully');

      // Only delete old image after successful save
      if (oldFileName && !oldFileName.startsWith('http')) {
        const oldImagePath = path.join(uploadsDir, oldFileName);
        try {
          await fs.unlink(oldImagePath);
          console.log('Old image deleted:', oldImagePath);
        } catch (error) {
          console.error('Error deleting old profile image:', error);
          // Don't throw error here, as the new image is already saved
        }
      }

      return user;
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  }

  // Get user permissions
  async getUserPermissions(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        include: [{
          model: RolePermission
        }]
      }]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.Role.RolePermissions;
  }

  // Verify Reset Token
  async verifyResetToken(token) {
    try {
      const user = await User.findOne({
        where: {
          reset_token: token,
          reset_token_expiry: {
            [Op.gt]: new Date() // Token not expired
          }
        }
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error verifying reset token:', error);
      throw error;
    }
  }

  // Forgot Password - Send reset link
  async forgotPassword(email) {
    try {
      console.log('Starting forgot password process for email:', email);
      
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log('User not found for email:', email);
        throw new Error('User not found');
      }
      console.log('User found:', user.username);

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      console.log('Generated reset token');

      // Save reset token and expiry to user
      await user.update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
      });
      console.log('Updated user with reset token');

      // Create reset URL
      const resetUrl = `http://localhost:${process.env.PORT}/api/users/reset-password/${resetToken}`;
      console.log('Reset URL:', resetUrl);

      // Send email
      console.log('Configuring email transport...');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      console.log('Creating email options...');
      const mailOptions = {
        from: `"Radhe Consultancy" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
            <p>Hello ${user.username},</p>
            <p>You requested a password reset for your Radhe Consultancy account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message, please do not reply to this email.</p>
          </div>
        `
      };

      console.log('Sending email...');
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');

      return { message: 'Password reset email sent' };
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      throw error;
    }
  }

  // Reset Password - Set new password using reset token
  async resetPassword(resetToken, newPassword) {
    try {
      const user = await User.findOne({
        where: {
          reset_token: resetToken,
          reset_token_expiry: {
            [Op.gt]: new Date() // Token not expired
          }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      await user.update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      throw error;
    }
  }

  // Change Password - Change password when logged in
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await user.update({ password: hashedPassword });

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService(); 