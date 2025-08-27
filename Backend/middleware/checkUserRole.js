const checkUserRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      console.log('Role check middleware:', {
        userId: user.user_id,
        userRoles: user.roles,
        allowedRoles,
        userObject: user
      });

      // Check if user has any of the allowed roles
      const userRoles = user.roles || [];
      
      // Check for exact role name matches first
      const hasExactMatch = userRoles.some(userRole => 
        allowedRoles.includes(userRole)
      );
      
      if (hasExactMatch) {
        console.log('Exact role match found:', { userRole: userRoles.find(r => allowedRoles.includes(r)) });
        return next();
      }
      
      // Fallback to normalized comparison for backward compatibility
      const normalizedUserRoles = userRoles.map(role => 
        role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      );
      const normalizedAllowedRoles = allowedRoles.map(role => 
        role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      );

      const hasNormalizedMatch = normalizedUserRoles.some(userRole => 
        normalizedAllowedRoles.includes(userRole)
      );

      if (!hasNormalizedMatch) {
        console.log('Role check failed:', {
          userRoles,
          allowedRoles,
          normalizedUserRoles,
          normalizedAllowedRoles
        });
        return res.status(403).json({ error: 'Access denied: insufficient role permissions' });
      }

      console.log('Normalized role match found');
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = checkUserRole; 