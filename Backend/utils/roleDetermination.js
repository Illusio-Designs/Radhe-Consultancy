const { User, Company, Consumer, Role } = require("../models");

const determineUserRole = async (email) => {
  try {
    console.log("Determining role for email:", email);

    // Check in User table first
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
        },
      ],
    });

    if (user && user.Roles && user.Roles.length > 0) {
      // Get primary role or first role
      const primaryRole =
        user.Roles.find((role) => role.UserRole?.is_primary) || user.Roles[0];
      const roleName = primaryRole ? primaryRole.role_name : "User";

      console.log("User found in User table:", {
        userId: user.user_id,
        role: roleName,
        allRoles: user.Roles.map((r) => r.role_name),
        primaryRole: primaryRole ? primaryRole.role_name : "None",
      });
      return {
        found: true,
        role: roleName,
        userData: user,
      };
    } else if (user) {
      // User exists but has no roles - this shouldn't happen but handle gracefully
      console.log("User found but has no roles:", {
        userId: user.user_id,
        email: user.email,
      });
      return {
        found: true,
        role: "User",
        userData: user,
      };
    }

    // Check in Company table
    const company = await Company.findOne({
      where: { company_email: email },
      include: [
        {
          model: User,
          as: "User",
          include: [
            {
              model: Role,
              attributes: ["role_name"],
              through: { attributes: ["is_primary"] },
            },
          ],
        },
      ],
    });

    if (company && company.User) {
      // Get primary role or first role
      const primaryRole =
        company.User.Roles.find((role) => role.UserRole?.is_primary) ||
        company.User.Roles[0];
      const roleName = primaryRole ? primaryRole.role_name : "Company";

      console.log("User found in Company table:", {
        userId: company.User.user_id,
        role: roleName,
        allRoles: company.User.Roles
          ? company.User.Roles.map((r) => r.role_name)
          : [],
      });
      return {
        found: true,
        role: roleName,
        userData: company.User,
      };
    }

    // Check in Consumer table
    const consumer = await Consumer.findOne({
      where: { email },
      include: [
        {
          model: User,
          as: "User",
          include: [
            {
              model: Role,
              attributes: ["role_name"],
              through: { attributes: ["is_primary"] },
            },
          ],
        },
      ],
    });

    if (consumer && consumer.User) {
      // Get primary role or first role
      const primaryRole =
        consumer.User.Roles.find((role) => role.UserRole?.is_primary) ||
        consumer.User.Roles[0];
      const roleName = primaryRole ? primaryRole.role_name : "Consumer";

      console.log("User found in Consumer table:", {
        userId: consumer.User.user_id,
        role: roleName,
        allRoles: consumer.User.Roles
          ? consumer.User.Roles.map((r) => r.role_name)
          : [],
      });
      return {
        found: true,
        role: roleName,
        userData: consumer.User,
      };
    }

    console.log("No user found for email:", email);
    return {
      found: false,
      role: null,
      userData: null,
    };
  } catch (error) {
    console.error("Error in determineUserRole:", error);
    throw error;
  }
};

module.exports = determineUserRole;
