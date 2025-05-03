const { User, Company, Consumer, Role } = require('../models');

const determineUserRole = async (email) => {
  try {
    console.log('Determining role for email:', email);

    // Check in User table first
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });

    if (user) {
      console.log('User found in User table:', {
        userId: user.user_id,
        role: user.Role.role_name
      });
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
      console.log('User found in Company table:', {
        userId: company.User.user_id,
        role: 'company'
      });
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
      console.log('User found in Consumer table:', {
        userId: consumer.User.user_id,
        role: 'consumer'
      });
      return {
        found: true,
        role: 'consumer',
        userData: consumer.User
      };
    }

    console.log('No user found for email:', email);
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