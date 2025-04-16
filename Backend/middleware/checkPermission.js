const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const RolePermission = require('../models/rolePermissionModel');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Get user's role
      const userRole = await Role.findByPk(req.user.role_id);
      if (!userRole) {
        return res.status(403).json({ message: 'Role not found' });
      }

      // If user is admin, grant all permissions
      if (userRole.role_name === 'admin') {
        return next();
      }

      // Get role permissions
      const rolePermissions = await RolePermission.findAll({
        where: { role_id: userRole.id },
        include: [{
          model: Permission,
          attributes: ['permission_name']
        }]
      });

      // Check if role has required permission
      const hasPermission = rolePermissions.some(rp => 
        rp.Permission.permission_name === requiredPermission
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action' 
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

module.exports = checkPermission;
