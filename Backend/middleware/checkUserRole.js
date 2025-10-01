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
      
      // Improved: Case-insensitive role check with detailed logging
      const normalizedUserRoles = (userRoles || []).map(role => role.toLowerCase());
      const normalizedAllowedRoles = (allowedRoles || []).map(role => role.toLowerCase());

      const hasMatch = normalizedUserRoles.some(userRole => normalizedAllowedRoles.includes(userRole));

      console.log('[checkUserRole] userRoles:', userRoles, 'allowedRoles:', allowedRoles, 'normalizedUserRoles:', normalizedUserRoles, 'normalizedAllowedRoles:', normalizedAllowedRoles, 'hasMatch:', hasMatch);

      if (!hasMatch) {
        return res.status(403).json({ error: 'Access denied: insufficient role permissions', debug: { userRoles, allowedRoles, normalizedUserRoles, normalizedAllowedRoles } });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = checkUserRole; 