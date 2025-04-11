const checkUserRole = (role) => {
  return (req, res, next) => {
    const user = req.user; // Assuming user is set in the request by authentication middleware
    if (!user || user.UserType.type_name !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

module.exports = checkUserRole;
