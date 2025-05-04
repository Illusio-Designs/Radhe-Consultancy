const checkUserRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Normalize role names
      const normalizedUserRole = user.Role.role_name.charAt(0).toUpperCase() + user.Role.role_name.slice(1).toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(role => 
        role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      );

      if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
        return res.status(403).json({ error: 'Access denied: insufficient role permissions' });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}; 