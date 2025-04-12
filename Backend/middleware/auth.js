const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Fetch the complete user with role information
    const user = await User.findByPk(decoded.userId, {
      attributes: ['user_id', 'email', 'role_id'],
      include: [{
        model: Role,
        attributes: ['id', 'role_name'],
        include: [{
          model: Permission,
          through: { attributes: [] },
          attributes: ['id', 'permission_name']
        }]
      }]
    });

    console.log('Fetched user:', {
      userId: user?.user_id,
      email: user?.email,
      roleId: user?.role_id,
      roleName: user?.Role?.role_name,
      permissions: user?.Role?.Permissions?.map(p => p.permission_name)
    });

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Export as an object with properties
module.exports = {
  authenticateToken
};