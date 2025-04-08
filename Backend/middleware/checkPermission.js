const { Role, Permission } = require('../models');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Get user's role with permissions
      const role = await Role.findByPk(user.role_id, {
        include: [{
          model: Permission,
          through: { attributes: [] }
        }]
      });

      if (!role) {
        return res.status(403).json({ error: 'Role not found' });
      }

      // Check if role has the required permission
      const hasPermission = role.Permissions.some(
        permission => permission.permission_name === requiredPermission
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = checkPermission;
