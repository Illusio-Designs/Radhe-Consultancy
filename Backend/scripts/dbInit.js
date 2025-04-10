const { sequelize } = require('../models');
const UserType = require('../models/userTypeModel');

async function initializeDatabase() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Sync all models with alter option
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');

    // Create default user types if they don't exist
    const userTypes = [
      { type_name: 'Office' },
      { type_name: 'Company' },
      { type_name: 'Consumer' }
    ];

    for (const type of userTypes) {
      await UserType.findOrCreate({
        where: { type_name: type.type_name },
        defaults: type
      });
    }

    // Create default roles if they don't exist
    const defaultRoles = [
      { role_name: 'Admin' },
      { role_name: 'User' }
    ];

    const Role = require('../models/roleModel');
    for (const role of defaultRoles) {
      await Role.findOrCreate({
        where: { role_name: role.role_name },
        defaults: role
      });
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = initializeDatabase;