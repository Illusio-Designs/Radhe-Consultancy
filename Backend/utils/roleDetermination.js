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
          as: 'roles',
          attributes: ["role_name"],
          through: { attributes: ["is_primary"] },
        },
      ],
    });

    if (user && user.roles && user.roles.length > 0) {
      // Get primary role or first role
      const primaryRole =
        user.roles.find((role) => role.UserRole?.is_primary) || user.roles[0];
      const roleName = primaryRole ? primaryRole.role_name : "User";

      console.log("User found in User table:", {
        userId: user.user_id,
        role: roleName,
        allRoles: user.roles.map((r) => r.role_name),
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
          as: "user",
          include: [
            {
              model: Role,
              as: 'roles',
              attributes: ["role_name"],
              through: { attributes: ["is_primary"] },
            },
          ],
        },
      ],
    });

    if (company && company.user) {
      // Get primary role or first role
      const primaryRole =
        company.user.roles.find((role) => role.UserRole?.is_primary) ||
        company.user.roles[0];
      const roleName = primaryRole ? primaryRole.role_name : "Company";

      console.log("User found in Company table:", {
        userId: company.user.user_id,
        role: roleName,
        allRoles: company.user.roles
          ? company.user.roles.map((r) => r.role_name)
          : [],
      });
      return {
        found: true,
        role: roleName,
        userData: company.user,
      };
    }

    // Check in Consumer table
    const consumer = await Consumer.findOne({
      where: { email },
      include: [
        {
          model: User,
          as: "user",
          include: [
            {
              model: Role,
              as: 'roles',
              attributes: ["role_name"],
              through: { attributes: ["is_primary"] },
            },
          ],
        },
      ],
    });

    if (consumer && consumer.user) {
      // Get primary role or first role
      const primaryRole =
        consumer.user.roles.find((role) => role.UserRole?.is_primary) ||
        consumer.user.roles[0];
      const roleName = primaryRole ? primaryRole.role_name : "Consumer";

      console.log("User found in Consumer table:", {
        userId: consumer.user.user_id,
        role: roleName,
        allRoles: consumer.user.roles
          ? consumer.user.roles.map((r) => r.role_name)
          : [],
      });
      return {
        found: true,
        role: roleName,
        userData: consumer.user,
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
