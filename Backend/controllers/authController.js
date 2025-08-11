const authService = require("../services/authService");
const { User, Role, Company, Consumer, Permission } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const determineUserRole = require("../utils/roleDetermination");
const userService = require("../services/userService");
const { sendWhatsAppOTP, verifyOTP } = require("../utils/otp");

class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.sendWhatsAppOTP = this.sendWhatsAppOTP.bind(this);
    this.verifyWhatsAppOTP = this.verifyWhatsAppOTP.bind(this);
  }

  async register(req, res) {
    try {
      const { email, password, username, role_name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Get role
      const role = await Role.findOne({ where: { role_name } });
      if (!role) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Create user with roles
      const user = await userService.createUser({
        email,
        password,
        username,
        role_ids: [role.id],
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, role: role.role_name },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          username: user.username,
          role_name: role.role_name,
        },
      });
    } catch (error) {
      console.error('Register error:', error.message);
      if (error.name === 'SequelizeUniqueConstraintError') {
        const fields = error.errors ? error.errors.map(e => e.path).join(', ') : 'unknown';
        return res.status(400).json({ error: `Duplicate entry: ${fields} must be unique.` });
      } else if (error.name === 'SequelizeValidationError') {
        const details = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
        return res.status(400).json({ error: `Validation error: ${details}` });
      } else {
        return res.status(500).json({ error: `Registration failed: ${error.message}` });
      }
    }
  }

  async login(req, res) {
    try {
      console.log("Login attempt:", { email: req.body.email });

      const { email, password } = req.body;

      if (!email || !password) {
        console.log("Login failed: Missing credentials");
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Determine user role and get user data
      const { found, role, userData } = await determineUserRole(email);

      if (!found) {
        console.log("Login failed: User not found for email:", email);
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      // Validate password
      try {
        const isValidPassword = await userData.validatePassword(password);
        if (!isValidPassword) {
          console.log("Login failed: Invalid password for user:", email);
          return res.status(401).json({
            success: false,
            error: "Invalid credentials",
          });
        }
      } catch (error) {
        console.error("Password validation error:", error);
        return res.status(500).json({
          success: false,
          error: "Error validating password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: userData.user_id,
          email: userData.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

             // Get all roles as strings
       const roles = userData.roles
         ? userData.roles.map((r) => r.role_name)
         : [];

      // Get role-specific data
      let additionalData = {};
      if (roles.includes("Company")) {
        const companyData = await Company.findOne({
          where: { user_id: userData.user_id },
        });
        additionalData = { company: companyData };
      } else if (roles.includes("Consumer")) {
        const consumerData = await Consumer.findOne({
          where: { user_id: userData.user_id },
        });
        additionalData = { consumer: consumerData };
      }

      console.log("Login successful for user:", email, "with roles:", roles);

      res.json({
        success: true,
        token,
        user: {
          id: userData.user_id,
          username: userData.username,
          email: userData.email,
          imageUrl: userData.profile_image,
          phone: userData.contact_number,
          roles,
          ...additionalData,
        },
      });
    } catch (error) {
      console.error('Login error:', error.message);
      return res.status(500).json({
        success: false,
        error: `An error occurred during login: ${error.message}`,
      });
    }
  }

  async googleLogin(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Google token is required" });
      }

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name, picture } = payload;

      // Determine role based on email in Company/Consumer tables
      let roleName = "User";
      const company = await Company.findOne({ where: { company_email: email } });
      if (company) {
        roleName = "Company";
      } else {
        const consumer = await Consumer.findOne({ where: { email } });
        if (consumer) {
          roleName = "Consumer";
        }
      }
      // Get role object
      const role = await Role.findOne({ where: { role_name: roleName } });
      if (!role) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Check if user exists
      let user = await User.findOne({
        where: { email },
        include: [
          {
            model: Role,
            as: 'roles',
            attributes: ["role_name"],
            through: { attributes: ["is_primary"] },
          },
        ],
      });

      if (!user) {
        // Create new user with role
        user = await userService.createUser({
          username: name,
          email,
          profile_image: picture,
          role_ids: [role.id],
        });
      } else {
        // Ensure user has the correct role
        const hasRole = user.roles.some((r) => r.role_name === roleName);
        if (!hasRole) {
          await user.addRole(role, { through: { is_primary: true, assigned_by: user.user_id } });
        }
      }

      // Refetch user with updated roles
      user = await User.findOne({
        where: { email },
        include: [
          {
            model: Role,
            as: 'roles',
            attributes: ["role_name"],
            through: { attributes: ["is_primary"] },
          },
        ],
      });

      // Get primary role or first role
      const primaryRole = user.roles.find((role) => role.UserRole?.is_primary) || user.roles[0];
      const finalRoleName = primaryRole ? primaryRole.role_name : roleName;

      // Generate JWT token
      const authToken = jwt.sign(
        { userId: user.user_id, role: finalRoleName },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token: authToken,
        user: {
          user_id: user.user_id,
          email: user.email,
          username: user.username,
          role_name: finalRoleName,
          profile_image: user.profile_image,
          roles: user.roles.map((r) => r.role_name),
        },
      });
    } catch (error) {
      console.error('Google login error:', error.message);
      return res.status(401).json({ error: `Google login failed: ${error.message}` });
    }
  }

  async getCurrentUser(req, res) {
    try {
      console.log("getCurrentUser: Request user object:", req.user);

      // Use user_id instead of userId
      const userId = req.user.user_id;

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
            as: 'roles',
            attributes: ["role_name"],
            through: { attributes: ["is_primary"] },
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all roles as strings
      const roles = user.roles ? user.roles.map((r) => r.role_name) : [];

      // Get role-specific data
      let additionalData = {};
      if (roles.includes("Company")) {
        const companyData = await Company.findOne({
          where: { user_id: userId },
        });
        additionalData = { company: companyData };
      } else if (roles.includes("Consumer")) {
        const consumerData = await Consumer.findOne({
          where: { user_id: userId },
        });
        additionalData = { consumer: consumerData };
      }

      // Format the response
      res.json({
        user: {
          id: user.user_id,
          email: user.email,
          username: user.username,
          phone: user.contact_number,
          imageUrl: user.profile_image,
          roles,
          ...additionalData,
        },
      });
    } catch (error) {
      console.error('Error getting current user:', error.message);
      return res.status(500).json({ message: `Error getting user information: ${error.message}` });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required",
        });
      }

      // Call the userService to send the email
      await userService.forgotPassword(email);

      res.json({
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    } catch (error) {
      console.error('Forgot password error:', error.message);
      return res.status(500).json({
        success: false,
        error: `An error occurred while processing your request: ${error.message}`,
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: "New password is required",
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Update password
      user.password = password;
      await user.save();

      res.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      console.error('Reset password error:', error.message);
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid or expired reset token",
        });
      }
      return res.status(500).json({
        success: false,
        error: `An error occurred while resetting your password: ${error.message}`,
      });
    }
  }

  async sendWhatsAppOTP(req, res) {
    try {
      const { phone } = req.body;

      // Validate phone number
      if (!phone || phone.length < 10) {
        return res.status(400).json({ message: "Invalid phone number" });
      }

      // Check if user exists with this phone number in any of the tables
      const user = await User.findOne({
        where: { contact_number: phone },
      });

      const company = await Company.findOne({
        where: { contact_number: phone },
      });

      const consumer = await Consumer.findOne({
        where: { phone_number: phone },
      });

      if (!user && !company && !consumer) {
        return res
          .status(404)
          .json({ message: "No account found with this phone number" });
      }

      // Send OTP
      await sendWhatsAppOTP(phone);
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error('Send OTP error:', error.message);
      return res.status(500).json({ message: `Failed to send OTP: ${error.message}` });
    }
  }

  async verifyWhatsAppOTP(req, res) {
    try {
      const { phone, otp } = req.body;

      // Validate inputs
      if (!phone || !otp) {
        return res.status(400).json({ message: "Phone and OTP are required" });
      }

      // Verify OTP
      const isValid = verifyOTP(phone, otp);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      // Get user from any of the tables
      const user = await User.findOne({
        where: { contact_number: phone },
      });

      const company = await Company.findOne({
        where: { contact_number: phone },
      });

      const consumer = await Consumer.findOne({
        where: { phone_number: phone },
      });

      let userData = null;
      let userType = null;

      if (user) {
        userData = user;
        userType = "user";
      } else if (company) {
        userData = company;
        userType = "company";
      } else if (consumer) {
        userData = consumer;
        userType = "consumer";
      } else {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: userData.id,
          email: userData.email,
          type: userType,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.username,
          phone: phone,
          type: userType,
        },
      });
    } catch (error) {
      console.error('Verify OTP error:', error.message);
      return res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
  }
}

// Create and export a single instance of the controller
const authController = new AuthController();
module.exports = authController;
