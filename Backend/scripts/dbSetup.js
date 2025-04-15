const sequelize = require('../config/db');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const RolePermission = require('../models/rolePermissionModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Define tables structure
    const tables = [
      {
        name: 'roles',
        create: `
          CREATE TABLE IF NOT EXISTS roles (
            id INT PRIMARY KEY AUTO_INCREMENT,
            role_name ENUM('user', 'admin', 'vendor_manager', 'user_manager', 'company', 'consumer') NOT NULL UNIQUE,
            description VARCHAR(255) NULL
          );
        `,
        alter: `
          ALTER TABLE roles
          MODIFY COLUMN role_name ENUM('user', 'admin', 'vendor_manager', 'user_manager', 'company', 'consumer') NOT NULL UNIQUE;
        `
      },
      {
        name: 'permissions',
        create: `
          CREATE TABLE IF NOT EXISTS permissions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            permission_name VARCHAR(255) NOT NULL UNIQUE
          );
        `,
        alter: `
          ALTER TABLE permissions
          MODIFY COLUMN permission_name VARCHAR(255) NOT NULL UNIQUE;
        `
      },
      {
        name: 'rolepermissions',
        create: `
          CREATE TABLE IF NOT EXISTS rolepermissions (
            role_id INT NOT NULL,
            permission_id INT NOT NULL,
            PRIMARY KEY (role_id, permission_id),
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
          );
        `,
        alter: `
          ALTER TABLE rolepermissions
          MODIFY COLUMN role_id INT NOT NULL,
          MODIFY COLUMN permission_id INT NOT NULL,
          ADD FOREIGN KEY IF NOT EXISTS (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          ADD FOREIGN KEY IF NOT EXISTS (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
        `
      },
      {
        name: 'companies',
        create: `
          CREATE TABLE IF NOT EXISTS companies (
            company_id INT AUTO_INCREMENT PRIMARY KEY,
            company_name VARCHAR(255) NOT NULL,
            owner_name VARCHAR(255) NOT NULL,
            company_address TEXT NOT NULL,
            contact_number VARCHAR(20) NOT NULL,
            company_email VARCHAR(255) NOT NULL UNIQUE,
            gst_number VARCHAR(15) NOT NULL UNIQUE,
            pan_number VARCHAR(10) NOT NULL UNIQUE,
            firm_type ENUM('Proprietorship', 'Partnership', 'LLP', 'Private Limited') NOT NULL,
            company_website VARCHAR(255) NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
          );
        `
      },
      {
        name: 'consumers',
        create: `
          CREATE TABLE IF NOT EXISTS consumers (
            consumer_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone_number VARCHAR(20) NOT NULL,
            contact_address TEXT NOT NULL,
            profile_image VARCHAR(255) NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
          );
        `
      },
      {
        name: 'users',
        create: `
          CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NULL,
            google_id VARCHAR(255) NULL UNIQUE,
            profile_image VARCHAR(255) NULL,
            role_id INT NOT NULL,
            reset_token VARCHAR(255) NULL,
            reset_token_expiry DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id)
          );
        `
      }
    ];

    // Create/update tables
    for (const table of tables) {
      try {
        console.log(`Setting up table ${table.name}...`);
        await sequelize.query(table.create);
        if (table.alter) {
          await sequelize.query(table.alter);
        }
        console.log(`Table ${table.name} setup completed`);
      } catch (error) {
        console.error(`Error processing table ${table.name}:`, error.message);
        throw error;
      }
    }

    // Create default roles
    const defaultRoles = [
      { role_name: 'user', description: 'Default user role' },
      { role_name: 'admin', description: 'Administrator with full access' },
      { role_name: 'vendor_manager', description: 'Manages vendors and companies' },
      { role_name: 'user_manager', description: 'Manages users and consumers' },
      { role_name: 'company', description: 'Company user' },
      { role_name: 'consumer', description: 'Consumer user' }
    ];

    for (const role of defaultRoles) {
      await Role.findOrCreate({
        where: { role_name: role.role_name },
        defaults: role
      });
    }

    // Create default permissions
    const permissions = [
      { permission_name: 'create_user' },
      { permission_name: 'delete_user' },
      { permission_name: 'view_user' },
      { permission_name: 'edit_user' },
      { permission_name: 'create_company' },
      { permission_name: 'delete_company' },
      { permission_name: 'view_company' },
      { permission_name: 'edit_company' },
      { permission_name: 'create_consumer' },
      { permission_name: 'delete_consumer' },
      { permission_name: 'view_consumer' },
      { permission_name: 'edit_consumer' },
      { permission_name: 'manage_roles' },
      { permission_name: 'manage_permissions' }
    ];

    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { permission_name: permission.permission_name },
        defaults: permission
      });
    }

    // Assign permissions to roles
    const rolePermissions = [
      // Admin has all permissions
      { role_name: 'admin', permissions: permissions.map(p => p.permission_name) },
      
      // Vendor Manager permissions
      { 
        role_name: 'vendor_manager', 
        permissions: [
          'create_company', 'delete_company', 'view_company', 'edit_company'
        ] 
      },
      
      // User Manager permissions
      { 
        role_name: 'user_manager', 
        permissions: [
          'create_user', 'delete_user', 'view_user', 'edit_user',
          'create_consumer', 'delete_consumer', 'view_consumer', 'edit_consumer'
        ] 
      },
      
      // Company permissions
      { 
        role_name: 'company', 
        permissions: [
          'view_company', 'edit_company'
        ] 
      },
      
      // Consumer permissions
      { 
        role_name: 'consumer', 
        permissions: [
          'view_consumer', 'edit_consumer'
        ] 
      },
      
      // Regular user has no special permissions
      { role_name: 'user', permissions: [] }
    ];

    for (const rolePerm of rolePermissions) {
      const role = await Role.findOne({ where: { role_name: rolePerm.role_name } });
      if (role) {
        for (const permName of rolePerm.permissions) {
          const permission = await Permission.findOne({ where: { permission_name: permName } });
          if (permission) {
            await RolePermission.findOrCreate({
              where: {
                role_id: role.id,
                permission_id: permission.id
              }
            });
          }
        }
      }
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}

module.exports = setupDatabase; 