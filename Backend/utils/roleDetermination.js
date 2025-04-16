const User = require('../models/userModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const Role = require('../models/roleModel');

async function determineUserRole(email) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return existingUser.role_id;
    }

    // Check if email exists in company table
    const company = await Company.findOne({ where: { email } });
    if (company) {
      const companyRole = await Role.findOne({ where: { role_name: 'company' } });
      return companyRole.id;
    }

    // Check if email exists in consumer table
    const consumer = await Consumer.findOne({ where: { email } });
    if (consumer) {
      const consumerRole = await Role.findOne({ where: { role_name: 'consumer' } });
      return consumerRole.id;
    }

    // If email not found in any table, assign default user role
    const defaultRole = await Role.findOne({ where: { role_name: 'user' } });
    return defaultRole.id;
  } catch (error) {
    console.error('Error determining user role:', error);
    throw error;
  }
}

module.exports = determineUserRole; 