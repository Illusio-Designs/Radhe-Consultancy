const authService = require('../services/authService');
const { User, UserType } = require('../models');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, role_id } = req.body;
      
      // Find Office user type
      const officeType = await UserType.findOne({ where: { type_name: 'Office' } });
      if (!officeType) {
        return res.status(500).json({ error: 'Office user type not found' });
      }

      // Create user with Office type
      const user = await User.create({
        email,
        password,
        role_id: role_id || 2, // Default to User role
        user_type_id: officeType.user_type_id
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;
      const { email } = await verifyGoogleToken(idToken); // Implement this function

      // Find user by email and include user type
      const user = await User.findOne({ 
        where: { email },
        include: [UserType]
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user with type information
      res.json({
        user_id: user.user_id,
        email: user.email,
        user_type: user.UserType.type_name,
        role_id: user.role_id
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();