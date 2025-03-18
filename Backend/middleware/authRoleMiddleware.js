const isAuthenticatedAndAuthorized = (allowedRoles) => {
    return (req, res, next) => {
        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: 'Unauthorized: You must be logged in.' });
        }

        // Check if the user's role is allowed
        if (allowedRoles.includes(req.user.role)) {
            return next(); // User is authorized, proceed to the next middleware/route handler
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this resource.' });
        }
    };
};

module.exports = isAuthenticatedAndAuthorized;
