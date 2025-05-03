const authService = require('../services/authService');
const { User, Role, Company, Consumer, Permission } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const determineUserRole = require('../utils/roleDetermination');

class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
  }

  async register(req, res) {
    try {
      const { email, password, username, role_name = 'user' } = req.body;

      // Validate required fields
      if (!email || !password || !username) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Get role
      const role = await Role.findOne({ where: { role_name } });
      if (!role) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        username,
        role_id: role.id
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, role: role.role_name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          username: user.username,
          role_id: user.role_id,
          role_name: role.role_name
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      console.log('Login attempt:', { email: req.body.email });
      
      const { email, password } = req.body;
      
      if (!email || !password) {
        console.log('Login failed: Missing credentials');
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Determine user role and get user data
      const { found, role, userData } = await determineUserRole(email);

      if (!found) {
        console.log('Login failed: User not found for email:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Validate password
      try {
        const isValidPassword = await userData.validatePassword(password);
        if (!isValidPassword) {
          console.log('Login failed: Invalid password for user:', email);
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
        }
      } catch (error) {
        console.error('Password validation error:', error);
        return res.status(500).json({
          success: false,
          error: 'Error validating password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: userData.user_id, 
          role: role,
          email: userData.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Get role-specific data
      let additionalData = {};
      if (role === 'company') {
        const companyData = await Company.findOne({
          where: { user_id: userData.user_id }
        });
        additionalData = { company: companyData };
      } else if (role === 'consumer') {
        const consumerData = await Consumer.findOne({
          where: { user_id: userData.user_id }
        });
        additionalData = { consumer: consumerData };
      }

      console.log('Login successful for user:', email);

      res.json({
        success: true,
        token,
        user: {
          id: userData.user_id,
          username: userData.username,
          email: userData.email,
          role: role,
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred during login'
      });
    }
  }

  async googleLogin(req, res) {
    try {
      const { token, role_name = 'user' } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Google token is required' });
      }

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      const { email, name, picture } = payload;

      // Get role
      const role = await Role.findOne({ where: { role_name } });
      if (!role) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Check if user exists
      let user = await User.findOne({
        where: { email },
        include: [{
          model: Role,
          attributes: ['role_name']
        }]
      });

      if (!user) {
        // Create new user
        user = await User.create({
          username: name,
          email,
          profile_image: picture,
          role_id: role.id
        });
      }

      // Generate JWT token
      const authToken = jwt.sign(
        { userId: user.user_id, role: role.role_name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token: authToken,
        user: {
          user_id: user.user_id,
          email: user.email,
          username: user.username,
          role_id: user.role_id,
          role_name: role.role_name,
          profile_image: user.profile_image
        }
      });
    } catch (error) {
      console.error('Google login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  async getCurrentUser(req, res) {
    try {
      console.log('getCurrentUser: Request user object:', req.user);
      
      // Use user_id instead of userId
      const userId = req.user.user_id;
      const userRole = req.user.role_name;
      
      console.log('getCurrentUser: Looking up user with ID:', userId);
      
      // Fetch the user with their role and permissions
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
        console.log('getCurrentUser: User not found for ID:', userId);
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('getCurrentUser: User found:', { 
        id: user.user_id, 
        email: user.email, 
        role: userRole,
        profile_image: user.profile_image
      });

      // Get role-specific data
      let additionalData = {};
      if (userRole === 'company') {
        const companyData = await Company.findOne({
          where: { user_id: userId }
        });
        additionalData = { company: companyData };
      } else if (userRole === 'consumer') {
        const consumerData = await Consumer.findOne({
          where: { user_id: userId }
        });
        additionalData = { consumer: consumerData };
      }

      res.json({
        user: {
          id: user.user_id,
          email: user.email,
          username: user.username,
          role: user.Role.role_name,
          contact_number: user.contact_number,
          imageUrl: user.profile_image,
          permissions: user.Role.Permissions?.map(p => p.permission_name) || [],
          ...additionalData
        }
      });
    } catch (error) {
      console.error('getCurrentUser error:', error);
      res.status(500).json({ message: 'Error getting user information' });
    }
  }
}

// Create and export a single instance of the controller
const authController = new AuthController();
module.exports = authController;