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
  async googleLogin(token, userType) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      
      if (userType === 'vendor') {
        return this.handleVendorGoogleLogin(payload);
      } else {
        return this.handleOfficeGoogleLogin(payload);
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Invalid Google token');
    }
  }

  async handleVendorGoogleLogin(payload) {
    let vendor = await Vendor.findOne({
      where: { 
        [Op.or]: [
          { google_id: payload.sub },
          { email: payload.email }
        ]
      }
    });

    if (!vendor) {
      vendor = await Vendor.create({
        email: payload.email,
        name: payload.name,
        google_id: payload.sub,
        profile_image: payload.picture,
        status: 'Active',
        vendor_type: 'Individual'
      });
    } else if (!vendor.google_id) {
      await vendor.update({ 
        google_id: payload.sub,
        profile_image: payload.picture
      });
    }

    const token = generateToken(vendor.vendor_id, 'vendor');
    return { user: vendor, token };
  }

  async handleOfficeGoogleLogin(payload) {
    const officeType = await UserType.findOne({ 
      where: { type_name: 'Office' } 
    });

    let user = await User.findOne({
      where: { email: payload.email },
      include: [UserType, Role]
    });

    if (!user) {
      user = await User.create({
        email: payload.email,
        username: payload.name,
        google_id: payload.sub,
        profile_image: payload.picture,
        user_type_id: officeType.user_type_id,
        role_id: 2 // Default to User role
      });
      
      // Fetch the complete user data with associations
      user = await User.findOne({
        where: { user_id: user.user_id },
        include: [UserType, Role]
      });
    }

    const token = generateToken(user.user_id, user.Role.role_name);
    return { user, token };
  }
}

module.exports = new AuthService();