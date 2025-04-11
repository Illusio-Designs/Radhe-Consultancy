const { Role, Permission } = require('../models');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const user = req.user; // Assuming user is set in the request by authentication middleware

    // Fetch user's role and permissions
    const role = await Role.findByPk(user.role_id, {
      include: [{ model: Permission, through: { attributes: [] } }]
    });

    if (!role || !role.Permissions.some(p => p.permission_name === requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = checkPermission;
