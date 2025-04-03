const authService = require('../services/authService');

class AuthController {
  // Regular login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  // Google login
  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: 'ID Token is required' });
      }
      console.log('Received ID Token:', idToken);
      const result = await authService.googleLogin(idToken);
      res.json(result);
    } catch (error) {
      console.error('Google login error in controller:', error);
      res.status(401).json({ error: error.message });
    }
  }

  // Register new user
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController(); 