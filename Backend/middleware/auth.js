const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Role = require('../models/roleModel');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await User.findOne({
      where: { user_id: decoded.userId },
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user and role information to request
    req.user = {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
      role_name: user.Role.role_name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.role_name;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  auth,
  checkRole
};