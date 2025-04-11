const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt'); // Add this import
const { User, Role } = require('../models');
const { generateToken, comparePassword } = require('../utils/helperFunctions');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  // Regular login
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
  
      const user = await User.findOne({
        where: { email },
        include: [{ model: Role }]
      });
  
      if (!user) {
        throw new Error('No account found with this email');
      }
  
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Incorrect password');
      }
  
      const token = generateToken(user.user_id, user.Role.role_name);
      return { 
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.Role.role_name
        },
        token 
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login. Please check your credentials');
    }
  }

  // Generate unique username
  async generateUniqueUsername(baseUsername) {
    let username = baseUsername;
    let counter = 1;
    let existingUser = await User.findOne({ where: { username } });

    while (existingUser) {
      username = `${baseUsername}${counter}`;
      existingUser = await User.findOne({ where: { username } });
      counter++;
    }

    return username;
  }

  // Google login
  async googleLogin(token) {
    try {
      console.log('Verifying Google token...');
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      console.log('Token verified, payload:', payload);

      // First try to find user by google_id
      let user = await User.findOne({
        where: { google_id: payload.sub },
        include: [{ model: Role }]
      });

      // If not found by google_id, try to find by email
      if (!user) {
        user = await User.findOne({
          where: { email: payload.email },
          include: [{ model: Role }]
        });
      }

      if (!user) {
        console.log('Creating new user...');
        // Create new user if doesn't exist
        const defaultRole = await Role.findOne({ where: { role_name: 'User' } });
        if (!defaultRole) {
          throw new Error('Default role not found');
        }

        // Generate unique username from email
        const baseUsername = payload.email.split('@')[0];
        const username = await this.generateUniqueUsername(baseUsername);

        user = await User.create({
          email: payload.email,
          username: username,
          google_id: payload.sub,
          profile_image: payload.picture,
          role_id: defaultRole.role_id
        });

        // Fetch the created user with role
        user = await User.findOne({
          where: { user_id: user.user_id },
          include: [{ model: Role }]
        });
      } else if (!user.google_id) {
        // Update existing user with google_id if not set
        await user.update({ google_id: payload.sub });
      }

      const jwtToken = generateToken(user.user_id, user.Role.role_name);
      return { user, token: jwtToken };
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Invalid Google token');
    }
  }

  // Register new user
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Find or create default role
      let role = await Role.findOne({ where: { role_name: 'User' } });
      if (!role) {
        role = await Role.create({ role_name: 'User' });
      }

      // Generate unique username
      const username = await this.generateUniqueUsername(userData.username);

      // Create user with role_id
      const user = await User.create({
        ...userData,
        username,
        role_id: role.role_id
      });

      const token = generateToken(user.user_id, role.role_name);
      return { user, token };
    } catch (error) {
      throw new Error(error.message || 'Error creating user');
    }
  }
}

module.exports = new AuthService();