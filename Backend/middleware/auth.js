const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Role = require("../models/roleModel");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findOne({
      where: { user_id: decoded.userId },
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Extract roles from the user object
    const userRoles = user.roles ? user.roles.map((role) => role.role_name) : [];

    // Get all roles and determine primary role
    const allRoles = user.roles || [];
    const primaryRole =
      allRoles.find((role) => role.UserRole?.is_primary) || allRoles[0];
    const roleName = primaryRole ? primaryRole.role_name : "User";

    // Add user and role information to request
    req.user = {
      user_id: user.user_id,
      email: user.email,
      role_name: roleName,
      roles: userRoles,
      allRoles: allRoles,
      primaryRole: roleName,
    };

    console.log("Auth middleware - User authenticated:", {
      userId: user.user_id,
      email: user.email,
      primaryRole: roleName,
      allRoles: allRoles.map((r) => r.role_name),
      hasRoles: allRoles.length > 0,
    });

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Check if user has any of the allowed roles
    const userRoles = req.user.roles || [];
    const normalizedUserRoles = userRoles.map(
      (role) => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    );
    const normalizedAllowedRoles = allowedRoles.map(
      (role) => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    );

    const hasAllowedRole = normalizedUserRoles.some((userRole) =>
      normalizedAllowedRoles.includes(userRole)
    );

    if (!hasAllowedRole) {
      return res.status(403).json({
        success: false,
        error: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};

module.exports = {
  auth,
  checkRole,
};
