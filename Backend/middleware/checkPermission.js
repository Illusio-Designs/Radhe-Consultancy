const { Role, Permission } = require('../models');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      console.log('Checking permission:', {
        requiredPermission,
        userId: user?.user_id,
        roleId: user?.role_id,
        roleName: user?.Role?.role_name,
        userPermissions: user?.Role?.Permissions?.map(p => p.permission_name)
      });
      
      if (!user) {
        console.log('No user found in request');
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!user.Role) {
        console.log('No role found for user:', user.user_id);
        return res.status(403).json({ error: 'Role not found' });
      }

      const hasPermission = user.Role.Permissions.some(p => p.permission_name === requiredPermission);
      console.log('Permission check result:', {
        hasPermission,
        requiredPermission,
        userPermissions: user.Role.Permissions.map(p => p.permission_name)
      });

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = checkPermission;
