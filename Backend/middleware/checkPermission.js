const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const RolePermission = require('../models/rolePermissionModel');
const User = require('../models/userModel');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Get user with roles
      const user = await User.findOne({
        where: { user_id: req.user.user_id },
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['id', 'role_name'],
          through: { attributes: ['is_primary'] }
        }]
      });

      if (!user || !user.roles || user.roles.length === 0) {
        return res.status(403).json({ message: 'Role not found' });
      }

      // Check if any role is Admin
      const hasAdmin = user.roles.some(role => role.role_name.toLowerCase() === 'admin');
      if (hasAdmin) {
        return next();
      }

      // Check all roles for the required permission
      for (const role of user.roles) {
        const rolePermissions = await RolePermission.findAll({
          where: { role_id: role.id },
          include: [{
            model: Permission,
            attributes: ['permission_name']
          }]
        });
        const hasPermission = rolePermissions.some(rp => rp.Permission.permission_name === requiredPermission);
        if (hasPermission) {
          return next();
        }
      }

      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

module.exports = checkPermission;
