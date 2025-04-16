const { User, Company, Consumer, Role } = require('../models');

const determineUserRole = async (email) => {
  try {
    // Check in User table first
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });

    if (user) {
      return {
        found: true,
        role: user.Role.role_name,
        userData: user
      };
    }

    // Check in Company table
    const company = await Company.findOne({
      where: { company_email: email },
      include: [{
        model: User,
        include: [Role]
      }]
    });

    if (company) {
      return {
        found: true,
        role: 'company',
        userData: company.User
      };
    }

    // Check in Consumer table
    const consumer = await Consumer.findOne({
      where: { email },
      include: [{
        model: User,
        include: [Role]
      }]
    });

    if (consumer) {
      return {
        found: true,
        role: 'consumer',
        userData: consumer.User
      };
    }

    return {
      found: false,
      role: null,
      userData: null
    };
  } catch (error) {
    console.error('Error in determineUserRole:', error);
    throw error;
  }
};

module.exports = determineUserRole; 