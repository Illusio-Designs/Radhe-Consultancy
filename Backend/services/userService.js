const { User, Role, RolePermission } = require("../models");
const { processAndSaveImage, deleteFile } = require("../utils/helperFunctions");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const multer = require("multer");
const fs = require("fs").promises;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads", "profile-images");
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error("Error creating uploads directory:", error);
    throw error;
  }
};

class UserService {
  // Get all users with their roles
  async getAllUsers() {
    return User.findAll({
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: ["is_primary", "assigned_at"] },
        },
      ],
    });
  }

  // Get user by ID
  async getUserById(userId, options = {}) {
    try {
      const { transaction } = options;
      // Try with roles include
      const userWithRoles = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: ["is_primary", "assigned_at"] },
          },
        ],
        transaction,
      });
      if (userWithRoles) {
        console.log(`[UserService] getUserById: User with roles found for userId=${userId}`);
        return userWithRoles;
      } else {
        console.error(`[UserService] getUserById: No user found for userId=${userId} with roles. Trying without include...`);
        // Try without include
        const user = await User.findByPk(userId, { transaction });
        if (user) {
          console.log(`[UserService] getUserById: User found for userId=${userId} WITHOUT roles include`);
        } else {
          console.error(`[UserService] getUserById: No user found for userId=${userId} even WITHOUT roles include`);
        }
        return user;
      }
    } catch (error) {
      console.error(`[UserService] getUserById: Error fetching user for userId=${userId}:`, error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData, options = {}) {
    try {
      const { role_ids, ...userInfo } = userData;
      const { transaction } = options;

      // Create user first
      const user = await User.create(userInfo, { transaction });
      console.log('[UserService] createUser: User created:', user ? user.user_id : user);

      // Assign roles if provided
      if (role_ids && role_ids.length > 0) {
        const roles = await Role.findAll({
          where: { id: role_ids },
          transaction,
        });
        if (roles.length !== role_ids.length) {
          throw new Error("One or more roles not found");
        }

        // Assign roles with primary role logic
        for (let i = 0; i < roles.length; i++) {
          const isPrimary = i === 0; // First role is primary
          await user.addRole(roles[i], {
            through: {
              is_primary: isPrimary,
              assigned_by: user.user_id,
            },
            transaction,
          });
        }
      }

      // Return user with roles, using the same transaction
      const userWithRoles = await this.getUserById(user.user_id, { transaction });
      if (!userWithRoles) {
        console.error(`[UserService] createUser: getUserById returned null for user_id=${user.user_id}`);
      } else {
        console.log(`[UserService] createUser: getUserById returned user for user_id=${user.user_id}`);
      }
      return userWithRoles;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Find which field is duplicate
        const fields = error.errors ? error.errors.map(e => e.path).join(', ') : 'unknown';
        const message = `Duplicate entry: ${fields} must be unique.`;
        console.error('[UserService] Duplicate error:', message);
        throw new Error(message);
      } else if (error.name === 'SequelizeValidationError') {
        const details = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
        console.error('[UserService] Validation error:', details);
        throw new Error(`Validation error: ${details}`);
      } else {
        console.error('[UserService] Error in createUser:', error.message);
        throw new Error(`User creation failed: ${error.message}`);
      }
    }
  }

  // Update user
  async updateUser(userId, userData) {
    console.log("Updating user in service:", {
      userId,
      userData,
    });

    // Start a transaction
    const transaction = await User.sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        console.error("User not found:", userId);
        throw new Error("User not found");
      }

      console.log("Found user:", user.toJSON());

      // Handle role updates separately
      if (userData.role_ids !== undefined) {
        console.log("Processing role update:", userData.role_ids);

        // Remove all existing roles
        await user.setRoles([], { transaction });

        // Assign new roles if provided
        if (userData.role_ids.length > 0) {
          const roles = await Role.findAll({
            where: { id: userData.role_ids },
            transaction,
          });
          if (roles.length !== userData.role_ids.length) {
            throw new Error("One or more roles not found");
          }

          // Assign roles with primary role logic
          for (let i = 0; i < roles.length; i++) {
            const isPrimary = i === 0; // First role is primary
            await user.addRole(roles[i], {
              through: {
                is_primary: isPrimary,
                assigned_by: userId,
              },
              transaction,
            });
          }
        }
        console.log("Roles updated successfully");
      }

      // Handle other user data updates
      const updateData = { ...userData };
      delete updateData.role_ids; // Remove role_ids as it's already handled

      // If password is provided, hash it
      if (updateData.password) {
        console.log("Password provided, hashing...");
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      // Update other user data
      if (Object.keys(updateData).length > 0) {
        await User.update(updateData, {
          where: { user_id: userId },
          transaction,
        });
        console.log("User data updated successfully");
      }

      // Commit the transaction
      await transaction.commit();

      // Fetch the complete updated user with role information
      const completeUser = await this.getUserById(userId);
      console.log("Final user state:", completeUser.toJSON());
      return completeUser;
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeUniqueConstraintError') {
        const fields = error.errors ? error.errors.map(e => e.path).join(', ') : 'unknown';
        const message = `Duplicate entry: ${fields} must be unique.`;
        console.error('[UserService] Duplicate error:', message);
        throw new Error(message);
      } else if (error.name === 'SequelizeValidationError') {
        const details = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
        console.error('[UserService] Validation error:', details);
        throw new Error(`Validation error: ${details}`);
      } else {
        console.error('[UserService] Error updating user:', error.message);
        throw new Error(`User update failed: ${error.message}`);
      }
    }
  }

  // Delete user
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only try to delete if it's a local file
    if (user.profile_image && !user.profile_image.startsWith("http")) {
      const imagePath = path.join(process.env.UPLOAD_PATH, user.profile_image);
      await deleteFile(imagePath);
    }

    await user.destroy();
  }

  // Update user profile image
  async updateProfileImage(userId, file) {
    try {
      console.log("Updating profile image for user:", userId);
      const user = await User.findByPk(userId);
      if (!user) {
        console.error("User not found:", userId);
        throw new Error("User not found");
      }
      console.log("Found user:", user.toJSON());

      // Ensure uploads directory exists
      await ensureUploadsDir();

      // Save new profile image first
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, file.buffer);
      console.log("New image saved:", fileName);

      // Store old image filename for deletion
      const oldFileName = user.profile_image;

      // Update user profile image with new filename
      user.profile_image = fileName;
      await user.save();
      console.log("User profile image updated successfully");

      // Only delete old image after successful save
      if (oldFileName && !oldFileName.startsWith("http")) {
        const oldImagePath = path.join(uploadsDir, oldFileName);
        try {
          await fs.unlink(oldImagePath);
          console.log("Old image deleted:", oldImagePath);
        } catch (error) {
          console.error("Error deleting old profile image:", error);
          // Don't throw error here, as the new image is already saved
        }
      }

      return user;
    } catch (error) {
      console.error("Error updating profile image:", error);
      throw error;
    }
  }

  // Get user permissions
  async getUserPermissions(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: "roles",
          include: [
            {
              model: RolePermission,
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Collect all permissions from all user roles
    const allPermissions = [];
    user.roles.forEach((role) => {
      if (role.RolePermissions) {
        allPermissions.push(...role.RolePermissions);
      }
    });

    // Remove duplicates based on permission_id
    const uniquePermissions = allPermissions.filter(
      (permission, index, self) =>
        index ===
        self.findIndex((p) => p.permission_id === permission.permission_id)
    );

    return uniquePermissions;
  }

  // Verify Reset Token
  async verifyResetToken(token) {
    try {
      const user = await User.findOne({
        where: {
          reset_token: token,
          reset_token_expiry: {
            [Op.gt]: new Date(), // Token not expired
          },
        },
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error verifying reset token:", error);
      throw error;
    }
  }

  // Forgot Password - Send reset link
  async forgotPassword(email) {
    try {
      console.log("Starting forgot password process for email:", email);

      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log("User not found for email:", email);
        throw new Error("User not found");
      }
      console.log("User found:", user.username);

      // Generate reset token as JWT
      const resetToken = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      console.log("Generated JWT reset token");

      // Optionally, save the token to the user (not required for JWT verification)
      await user.update({
        reset_token: resetToken,
        reset_token_expiry: new Date(Date.now() + 3600000),
      });
      console.log("Updated user with JWT reset token");

      // Create reset URL
      const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;
      console.log("Reset URL:", resetUrl);

      // Send email
      console.log("Configuring email transport...");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      console.log("Creating email options...");
      const mailOptions = {
        from: `"Radhe Consultancy" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <div style="background: linear-gradient(135deg, #4299e1 0%, #90cdf4 100%); min-height: 100vh; padding: 40px 0; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="max-width: 400px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(66,153,225,0.15); padding: 2.5rem 2rem; text-align: center;">
              <h2 style="color: #2b6cb0; margin-bottom: 0.5rem;">Reset Your Password</h2>
              <p style="color: #4a5568; margin-bottom: 1.5rem; font-size: 1.1rem;">Hello <b>${
                user.username
              }</b>,<br/>You requested a password reset for your Radhe Consultancy account.</p>
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #4299e1 0%, #90cdf4 100%); color: #fff; padding: 0.75rem 2rem; border-radius: 6px; font-size: 1.1rem; font-weight: 600; text-decoration: none; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(66,153,225,0.10);">Reset Password</a>
              <p style="color: #718096; font-size: 0.95rem; margin-top: 1.5rem;">This link will expire in 1 hour.<br>If you didn't request this, you can safely ignore this email.</p>
              <hr style="margin: 2rem 0; border: none; border-top: 1px solid #e2e8f0;">
              <p style="color: #a0aec0; font-size: 0.85rem;">&copy; ${new Date().getFullYear()} Radhe Consultancy. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      console.log("Sending email...");
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");

      return { message: "Password reset email sent" };
    } catch (error) {
      console.error("Error in forgotPassword:", error);
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
            [Op.gt]: new Date(), // Token not expired
          },
        },
      });

      if (!user) {
        throw new Error("Invalid or expired reset token");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      await user.update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      });

      return { message: "Password reset successful" };
    } catch (error) {
      throw error;
    }
  }

  // Change Password - Change password when logged in
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await user.update({ password: hashedPassword });

      return { message: "Password changed successfully" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
