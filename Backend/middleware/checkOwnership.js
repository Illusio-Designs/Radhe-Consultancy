const { User, Company, Consumer, Role } = require('../models');

const checkOwnership = (type) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user with roles to determine primary role
      const userWithRoles = await User.findOne({
        where: { user_id: user.user_id },
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['role_name'],
          through: { attributes: ['is_primary'] }
        }]
      });

      if (!userWithRoles || !userWithRoles.roles || userWithRoles.roles.length === 0) {
        return res.status(403).json({ error: 'Role not found' });
      }

      // Get primary role or first role
      const primaryRole = userWithRoles.roles.find(role => role.UserRole?.is_primary) || userWithRoles.roles[0];
      const roleName = primaryRole.role_name;

      // Normalize role names
      const normalizedRoleName = roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();

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