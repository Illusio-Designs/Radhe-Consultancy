const authService = require('../services/authService');
const { User, UserType } = require('../models');

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Find Office user type
      const officeType = await UserType.findOne({ where: { type_name: 'Office' } });
      if (!officeType) {
        return res.status(500).json({ error: 'Office user type not found' });
      }

      // Create user with Office type
      const user = await User.create({
        username,
        email,
        password,
        user_type_id: officeType.user_type_id,
        role_id: 2 // Default to User role
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;
      const { email } = await verifyGoogleToken(idToken);

      // Find or create user with Office type
      const officeType = await UserType.findOne({ where: { type_name: 'Office' } });
      if (!officeType) {
        return res.status(500).json({ error: 'Office user type not found' });
      }

      let user = await User.findOne({ 
        where: { email },
        include: [UserType, Role]
      });

      if (!user) {
        // Create new Office user
        user = await User.create({
          email,
          google_id: idToken,
          user_type_id: officeType.user_type_id,
          role_id: 2 // Default to User role
        });
      }

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