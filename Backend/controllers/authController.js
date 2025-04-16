const authService = require('../services/authService');
const { User, UserType, Company, Consumer, Vendor, Role, Permission } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const determineUserRole = require('../utils/roleDetermination');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, username } = req.body;

      // Validate required fields
      if (!email || !password || !username) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Determine user role based on email
      const role_id = await determineUserRole(email);

      // Create user (password will be hashed by the model's beforeCreate hook)
      const user = await User.create({
        email,
        password,
        username,
        role_id
      });

      // Get role information
      const roleInfo = await Role.findByPk(role_id, {
        attributes: ['role_name']
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, role: roleInfo.role_name },
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
          role_name: roleInfo.role_name
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

      const user = await User.findOne({
        where: { email },
        include: [
          { model: Role, include: [Permission] },
          { model: Company },
          { model: Consumer }
        ]
      });

      if (!user) {
        console.log('Login failed: User not found for email:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      console.log('User found:', {
        id: user.user_id,
        email: user.email,
        role: user.Role?.role_name
      });

      const isValidPassword = await user.validatePassword(password);
      console.log('Password validation result:', isValidPassword);

      if (!isValidPassword) {
        console.log('Login failed: Invalid password for user:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate JWT token directly
      const token = jwt.sign(
        { 
          userId: user.user_id, 
          role: user.Role?.role_name,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('Login successful for user:', email);

      res.json({
        success: true,
        token,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.Role?.role_name,
          permissions: user.Role?.Permissions?.map(p => p.permission_name) || []
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
      const { token, userType } = req.body;
      
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

      // Check if user exists
      let user = await User.findOne({
        where: { email },
        include: [{
          model: UserType,
          attributes: ['type_name']
        }]
      });

      if (!user) {
        // Find the appropriate user type
        const userTypeRecord = await UserType.findOne({
          where: { type_name: userType }
        });

        if (!userTypeRecord) {
          return res.status(400).json({ error: 'Invalid user type' });
        }

        // Create new user
        user = await User.create({
          username: name,
          email,
          profile_image: picture,
          user_type_id: userTypeRecord.user_type_id,
          role_id: 2 // Default to User role
        });

        // If user type is Company, create company record
        if (userType.toLowerCase() === 'company') {
          const vendor = await Vendor.create({
            vendor_name: name,
            vendor_email: email,
            vendor_type: 'Company'
          });

          await Company.create({
            company_name: name,
            owner_name: name,
            company_email: email,
            contact_number: '', // Will be updated later
            company_address: '', // Will be updated later
            gst_number: '', // Will be updated later
            pan_number: '', // Will be updated later
            firm_type: 'Proprietorship', // Default value
            user_type_id: userTypeRecord.user_type_id,
            vendor_id: vendor.vendor_id
          });
        }
      }

      // Generate JWT token
      const authToken = jwt.sign(
        { userId: user.user_id, role: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Get vendor info if exists
      let vendor = null;
      if (userType.toLowerCase() === 'company') {
        vendor = await Vendor.findOne({
          where: { vendor_email: email },
          include: [{
            model: Company,
            attributes: ['company_id', 'company_name']
          }]
        });
      }

      res.json({
        token: authToken,
        user: {
          user_id: user.user_id,
          email: user.email,
          username: user.username,
          role_id: user.role_id,
          user_type: user.UserType?.type_name,
          profile_image: user.profile_image
        },
        vendor,
        userType: user.UserType?.type_name || userType
      });
    } catch (error) {
      console.error('Google login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  async checkUserType(req, res) {
    try {
      const { email } = req.body;
      
      // Check if user exists in User table
      const existingUser = await User.findOne({
        where: { email },
        include: [{
          model: UserType,
          attributes: ['type_name']
        }]
      });

      if (existingUser) {
        return res.json({
          exists: true,
          userType: existingUser.UserType.type_name,
          userId: existingUser.user_id,
          userTypeId: existingUser.user_type_id,
          canDelete: false // Users cannot delete their own accounts
        });
      }

      // Check if company exists
      const company = await Company.findOne({
        where: { company_email: email },
        include: [{
          model: UserType,
          attributes: ['type_name']
        }]
      });

      if (company) {
        return res.json({
          exists: true,
          userType: company.UserType.type_name,
          companyId: company.company_id,
          userTypeId: company.user_type_id,
          vendorId: company.vendor_id,
          canDelete: false, // Company users cannot delete their accounts
          canEdit: true // Company users can edit their info
        });
      }

      // Check if consumer exists
      const consumer = await Consumer.findOne({
        where: { email },
        include: [{
          model: UserType,
          attributes: ['type_name']
        }]
      });

      if (consumer) {
        return res.json({
          exists: true,
          userType: consumer.UserType.type_name,
          consumerId: consumer.consumer_id,
          userTypeId: consumer.user_type_id,
          vendorId: consumer.vendor_id,
          canDelete: false, // Consumers cannot delete their accounts
          canEdit: true // Consumers can edit their info
        });
      }

      // Check if vendor exists
      const vendor = await Vendor.findOne({
        where: { vendor_email: email }
      });

      if (vendor) {
        const userType = await UserType.findOne({
          where: { type_name: vendor.vendor_type }
        });

        return res.json({
          exists: true,
          userType: vendor.vendor_type,
          vendorId: vendor.vendor_id,
          userTypeId: userType.user_type_id,
          canDelete: false, // Vendors cannot delete their accounts
          canEdit: true // Vendors can edit their info
        });
      }

      // Default to Office user type
      const officeType = await UserType.findOne({
        where: { type_name: 'Office' }
      });

      return res.json({
        exists: false,
        userType: 'Office',
        userTypeId: officeType.user_type_id,
        canDelete: false, // Default users cannot delete their accounts
        canEdit: true // Default users can edit their info
      });
    } catch (error) {
      console.error('Error checking user type:', error);
      res.status(500).json({ error: 'Error checking user type' });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: ['user_id', 'email', 'username', 'role_id'],
        include: [{
          model: Role,
          attributes: ['role_name']
        }]
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role_id: user.role_id,
        role_name: user.Role.role_name
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();