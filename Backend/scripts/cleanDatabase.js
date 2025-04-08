require('dotenv').config();
const sequelize = require('../config/db');

async function cleanDatabase() {
  try {
    console.log('Attempting to connect with credentials:');
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    console.log('Host:', process.env.DB_HOST);

    // Test the connection first
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop all tables
    await sequelize.query('DROP TABLE IF EXISTS RolePermissions');
    await sequelize.query('DROP TABLE IF EXISTS Permissions');
    await sequelize.query('DROP TABLE IF EXISTS Roles');
    await sequelize.query('DROP TABLE IF EXISTS Users');
    await sequelize.query('DROP TABLE IF EXISTS Vendors');
    await sequelize.query('DROP TABLE IF EXISTS CompanyVendors');
    await sequelize.query('DROP TABLE IF EXISTS ConsumerVendors');
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Database cleaned successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase();
