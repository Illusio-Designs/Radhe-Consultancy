const { sequelize } = require('../models');
const UserType = require('../models/userTypeModel');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const RolePermission = require('../models/rolePermissionModel');
const Vendor = require('../models/vendorModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const User = require('../models/userModel');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization and synchronization...');
    
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Check and create UserTypes table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS UserTypes (
        user_type_id INT PRIMARY KEY AUTO_INCREMENT,
        type_name ENUM('Office', 'Company', 'Consumer') NOT NULL UNIQUE,
        description VARCHAR(255) NULL
      );
    `);

    // Check and create Roles table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_name VARCHAR(255) NOT NULL
      );
    `);

    // Check and create Permissions table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        permission_name VARCHAR(255) NOT NULL
      );
    `);

    // Check and create RolePermissions table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS RolePermissions (
        role_id INT,
        permission_id INT,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES Roles(id),
        FOREIGN KEY (permission_id) REFERENCES Permissions(id)
      );
    `);

    // Check and create Vendors table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Vendors (
        vendor_id INT PRIMARY KEY AUTO_INCREMENT,
        vendor_type ENUM('Company', 'Consumer') NOT NULL,
        google_id VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Check and create Companies table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Companies (
        company_id INT PRIMARY KEY AUTO_INCREMENT,
        vendor_id INT,
        company_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        company_address VARCHAR(255) NOT NULL,
        gst_number VARCHAR(15) NULL,
        pan_number VARCHAR(10) NULL,
        company_email VARCHAR(255) NULL,
        company_website VARCHAR(255) NULL,
        contact_number VARCHAR(15) NULL,
        firm_type VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
      );
    `);

    // Check and create Consumers table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Consumers (
        consumer_id INT PRIMARY KEY AUTO_INCREMENT,
        vendor_id INT,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255) NULL,
        phone_number VARCHAR(15) NULL,
        dob DATE NULL,
        gender ENUM('Male', 'Female', 'Other') NULL,
        national_id VARCHAR(50) NULL,
        contact_address VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
      );
    `);

    // Add timestamp columns to existing tables if they don't exist
    await sequelize.query(`
      ALTER TABLE Vendors 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `);

    await sequelize.query(`
      ALTER TABLE Companies 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `);

    await sequelize.query(`
      ALTER TABLE Consumers 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `);

    // Check and create Users table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        user_type_id INT,
        role_id INT,
        FOREIGN KEY (user_type_id) REFERENCES UserTypes(user_type_id),
        FOREIGN KEY (role_id) REFERENCES Roles(id)
      );
    `);

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
      { role_name: 'User' },
      { role_name: 'Vendor Manager' },
    ];

    for (const role of defaultRoles) {
      await Role.findOrCreate({
        where: { role_name: role.role_name },
        defaults: role
      });
    }

    // Create default permissions if they don't exist
    const permissions = [
      { permission_name: 'create_user' },
      { permission_name: 'delete_user' },
      { permission_name: 'view_vendor' },
      { permission_name: 'edit_vendor' },
    ];

    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { permission_name: permission.permission_name },
        defaults: permission
      });
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = initializeDatabase;