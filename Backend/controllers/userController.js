const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");
const Company = require("../models/companyModel");
const Consumer = require("../models/consumerModel");
const userService = require("../services/userService");
const { Op } = require("sequelize");
const sequelize = require("../config/db");

// Get all users with optional role filtering
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    console.log("[getAllUsers] Fetching users with role filter:", role);

    // First, let's check what roles exist in the database
    const allRoles = await Role.findAll();
    console.log(
      "[getAllUsers] All available roles in database:",
      allRoles.map((r) => ({ id: r.id, name: r.role_name }))
    );

    let includeOptions = {
      model: Role,
      as: "roles",
      attributes: ["role_name"],
      through: { attributes: ["is_primary"] },
    };

    // Apply role filtering based on query parameter
    if (role) {
      if (role === "company") {
        // Show users who have Company role (including both primary and secondary)
        includeOptions.where = { role_name: "Company" };
        console.log(
          "[getAllUsers] Filtering for Company role users (any role)"
        );
      } else if (role === "consumer") {
        // Show users who have Consumer role (including both primary and secondary)
        includeOptions.where = { role_name: "Consumer" };
        console.log(
          "[getAllUsers] Filtering for Consumer role users (any role)"
        );
      } else if (role === "other") {
        // Show users who have roles other than Company and Consumer
        includeOptions.where = {
          role_name: {
            [Op.notIn]: ["Company", "Consumer"],
          },
        };
        console.log(
          "[getAllUsers] Filtering for Other role users (excluding Company and Consumer)"
        );
      }
    }

    // Use a different approach for role filtering
    let users;
    if (role) {
      if (role === "company") {
        // Find users who have Company role
        users = await User.findAll({
          include: [
            {
              model: Role,
              as: "roles",
              where: { role_name: "Company" },
              attributes: ["role_name"],
              through: { attributes: ["is_primary"] },
              required: true, // This ensures only users with Company role are returned
            },
          ],
        });
      } else if (role === "consumer") {
        // Find users who have Consumer role
        users = await User.findAll({
          include: [
            {
              model: Role,
              as: "roles",
              where: { role_name: "Consumer" },
              attributes: ["role_name"],
              through: { attributes: ["is_primary"] },
              required: true, // This ensures only users with Consumer role are returned
            },
          ],
        });
      } else if (role === "other") {
        // Find users who have roles other than Company and Consumer
        users = await User.findAll({
          include: [
            {
              model: Role,
              as: "roles",
              where: {
                role_name: {
                  [Op.notIn]: ["Company", "Consumer"],
                },
              },
              attributes: ["role_name"],
              through: { attributes: ["is_primary"] },
              required: true, // This ensures only users with other roles are returned
            },
          ],
        });
      }
    } else {
      // No role filter - get all users
      users = await User.findAll({
        include: [includeOptions],
      });
    }

    console.log("[getAllUsers] Total users found:", users.length);
    console.log(
      "[getAllUsers] Users with roles:",
      users.map((u) => ({
        id: u.user_id,
        email: u.email,
        username: u.username,
        roles: u.roles.map((r) => ({
          name: r.role_name,
          isPrimary: r.UserRole?.is_primary,
        })),
      }))
    );

    // Also log all users without filtering to see what exists
    if (role) {
      const allUsers = await User.findAll({
        include: [
          {
            model: Role,
            as: "roles",
            attributes: ["role_name"],
            through: { attributes: ["is_primary"] },
          },
        ],
      });
      console.log("[getAllUsers] ALL users in database:", allUsers.length);
      console.log(
        "[getAllUsers] ALL users with roles:",
        allUsers.map((u) => ({
          id: u.user_id,
          email: u.email,
          username: u.username,
          roles: u.roles.map((r) => ({
            name: r.role_name,
            isPrimary: r.UserRole?.is_primary,
          })),
        }))
      );

      // Also check if there are any companies in the database
      const { Company } = require("../models");
      const allCompanies = await Company.findAll();
      console.log(
        "[getAllUsers] ALL companies in database:",
        allCompanies.length
      );
      console.log(
        "[getAllUsers] Companies:",
        allCompanies.map((c) => ({
          id: c.company_id,
          name: c.company_name,
          email: c.company_email,
          userId: c.user_id,
        }))
      );
    }

    res.json(users);
  } catch (error) {
    console.error("[getAllUsers] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get company users
const getCompanyUsers = async (req, res) => {
  try {
    console.log("[getCompanyUsers] Searching for users with Company role...");

    // First, let's check what roles exist
    const allRoles = await Role.findAll();
    console.log(
      "[getCompanyUsers] All available roles:",
      allRoles.map((r) => r.role_name)
    );

    // Check if Company role exists
    const companyRole = await Role.findOne({ where: { role_name: "Company" } });
    console.log(
      "[getCompanyUsers] Company role found:",
      companyRole ? companyRole.role_name : "NOT FOUND"
    );

    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "roles",
          where: { role_name: "Company" },
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
        },
      ],
    });

    console.log(
      "[getCompanyUsers] Found users with Company role:",
      users.length
    );
    console.log(
      "[getCompanyUsers] Users:",
      users.map((u) => ({
        id: u.user_id,
        email: u.email,
        roles: u.roles.map((r) => r.role_name),
      }))
    );

    res.json(users);
  } catch (error) {
    console.error("[getCompanyUsers] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get consumer users
const getConsumerUsers = async (req, res) => {
  try {
    console.log("[getConsumerUsers] Searching for users with Consumer role...");

    // Check if Consumer role exists
    const consumerRole = await Role.findOne({
      where: { role_name: "Consumer" },
    });
    console.log(
      "[getConsumerUsers] Consumer role found:",
      consumerRole ? consumerRole.role_name : "NOT FOUND"
    );

    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "roles",
          where: { role_name: "Consumer" },
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
        },
      ],
    });

    console.log(
      "[getConsumerUsers] Found users with Consumer role:",
      users.length
    );
    console.log(
      "[getConsumerUsers] Users:",
      users.map((u) => ({
        id: u.user_id,
        email: u.email,
        roles: u.roles.map((r) => r.role_name),
      }))
    );

    res.json(users);
  } catch (error) {
    console.error("[getConsumerUsers] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get other users (not company or consumer)
const getOtherUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "roles",
          where: {
            role_name: {
              [Op.notIn]: ["Company", "Consumer"],
            },
          },
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
        },
      ],
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
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
          include: [
            {
              model: Permission,
              through: { attributes: [] },
              attributes: ["permission_name"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get primary role or first role
    const primaryRole =
      user.roles.find((role) => role.UserRole?.is_primary) || user.roles[0];
    const roleName = primaryRole ? primaryRole.role_name : "User";

    res.json({
      id: user.user_id,
      email: user.email,
      username: user.username,
      contact_number: user.contact_number,
      imageUrl: user.profile_image,
      role: roleName,
      roles: user.roles.map((r) => r.role_name),
      permissions:
        primaryRole?.Permissions?.map((p) => p.permission_name) || [],
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
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = { ...req.body };
    await userService.updateUser(user.user_id, updateData);

    // Get updated user with role information and permissions
    const updatedUser = await User.findOne({
      where: { user_id: user.user_id },
      attributes: [
        "user_id",
        "email",
        "username",
        "contact_number",
        "profile_image",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
          include: [
            {
              model: Permission,
              through: { attributes: [] },
              attributes: ["permission_name"],
            },
          ],
        },
      ],
    });

    // Get primary role or first role
    const primaryRole =
      updatedUser.roles.find((role) => role.UserRole?.is_primary) ||
      updatedUser.roles[0];
    const roleName = primaryRole ? primaryRole.role_name : "User";

    res.json({
      id: updatedUser.user_id,
      email: updatedUser.email,
      username: updatedUser.username,
      contact_number: updatedUser.contact_number,
      imageUrl: updatedUser.profile_image,
      role: roleName,
      roles: updatedUser.roles.map((r) => r.role_name),
      permissions:
        primaryRole?.Permissions?.map((p) => p.permission_name) || [],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user information" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the imageUrl field
    await user.update({ imageUrl: `/uploads/${file.filename}` });

    res.json({
      message: "Profile image updated successfully",
      imageUrl: `/uploads/${file.filename}`,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Error updating profile image" });
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
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    const isMatch = await user.validatePassword(oldPassword);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, error: "Old password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
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
      attributes: [
        "user_id",
        "email",
        "username",
        "contact_number",
        "profile_image",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
          include: [
            {
              model: Permission,
              through: { attributes: [] },
              attributes: ["permission_name"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get primary role or first role
    const primaryRole =
      user.roles.find((role) => role.UserRole?.is_primary) || user.roles[0];
    const roleName = primaryRole ? primaryRole.role_name : "User";

    // Get role-specific data
    let additionalData = {};
    if (roleName === "Company") {
      const companyData = await Company.findOne({
        where: { user_id: userId },
      });
      additionalData = { company: companyData };
    } else if (roleName === "Consumer") {
      const consumerData = await Consumer.findOne({
        where: { user_id: userId },
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
      roles: user.roles.map((r) => r.role_name),
      permissions:
        primaryRole?.Permissions?.map((p) => p.permission_name) || [],
      ...additionalData,
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Error getting user information" });
  }
};

// Search users by username, email, or contact_number
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("username")),
            "LIKE",
            `%${q.toLowerCase()}%`
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("email")),
            "LIKE",
            `%${q.toLowerCase()}%`
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("contact_number")),
            "LIKE",
            `%${q.toLowerCase()}%`
          ),
        ],
      },
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
        },
      ],
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
  searchUsers,
};
