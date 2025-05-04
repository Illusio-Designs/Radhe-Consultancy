const { User, Company, Consumer } = require('../models');

const checkOwnership = (type) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Normalize role names
      const normalizedRoleName = user.Role.role_name.charAt(0).toUpperCase() + user.Role.role_name.slice(1).toLowerCase();

      // Admin can access all data
      if (normalizedRoleName === 'Admin') {
        return next();
      }

      const resourceId = req.params.id || req.body.id;
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      let hasAccess = false;

      switch (type) {
        case 'company':
          if (normalizedRoleName === 'Company') {
            const company = await Company.findByPk(resourceId);
            hasAccess = company && company.user_id === user.user_id;
          }
          break;

        case 'consumer':
          if (normalizedRoleName === 'Consumer') {
            const consumer = await Consumer.findByPk(resourceId);
            hasAccess = consumer && consumer.user_id === user.user_id;
          }
          break;

        default:
          return res.status(400).json({ error: 'Invalid resource type' });
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied: You can only access your own data' });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = checkOwnership; 