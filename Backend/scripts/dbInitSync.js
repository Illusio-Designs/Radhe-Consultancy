const sequelize = require('../config/db');
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

    // Check if tables exist and create/alter them accordingly
    const tables = [
      {
        name: 'usertypes',
        create: `
          CREATE TABLE IF NOT EXISTS usertypes (
            user_type_id INT PRIMARY KEY AUTO_INCREMENT,
            type_name ENUM('Office', 'Company', 'Consumer') NOT NULL UNIQUE,
            description VARCHAR(255) NULL
          );
        `,
        alter: `
          ALTER TABLE usertypes
          MODIFY COLUMN type_name ENUM('Office', 'Company', 'Consumer') NOT NULL UNIQUE,
          MODIFY COLUMN description VARCHAR(255) NULL;
        `
      },
      {
        name: 'roles',
        create: `
          CREATE TABLE IF NOT EXISTS roles (
            id INT PRIMARY KEY AUTO_INCREMENT,
            role_name VARCHAR(255) NOT NULL UNIQUE
          );
        `,
        alter: `
          ALTER TABLE roles
          MODIFY COLUMN role_name VARCHAR(255) NOT NULL UNIQUE;
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
        name: 'vendors',
        create: `
          CREATE TABLE IF NOT EXISTS vendors (
            vendor_id INT PRIMARY KEY AUTO_INCREMENT,
            vendor_type ENUM('Company', 'Consumer') NOT NULL,
            google_id VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          );
        `,
        alter: `
          ALTER TABLE vendors
          MODIFY COLUMN vendor_type ENUM('Company', 'Consumer') NOT NULL,
          MODIFY COLUMN google_id VARCHAR(255) NULL,
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
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
            user_type_id INT NOT NULL,
            vendor_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_type_id) REFERENCES usertypes(user_type_id),
            FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
          );
        `,
        alter: `
          ALTER TABLE companies
          MODIFY COLUMN company_name VARCHAR(255) NOT NULL,
          MODIFY COLUMN owner_name VARCHAR(255) NOT NULL,
          MODIFY COLUMN company_address TEXT NOT NULL,
          MODIFY COLUMN contact_number VARCHAR(20) NOT NULL,
          MODIFY COLUMN company_email VARCHAR(255) NOT NULL UNIQUE,
          MODIFY COLUMN gst_number VARCHAR(15) NOT NULL UNIQUE,
          MODIFY COLUMN pan_number VARCHAR(10) NOT NULL UNIQUE,
          MODIFY COLUMN firm_type ENUM('Proprietorship', 'Partnership', 'LLP', 'Private Limited') NOT NULL,
          MODIFY COLUMN company_website VARCHAR(255) NULL,
          MODIFY COLUMN user_type_id INT NOT NULL,
          MODIFY COLUMN vendor_id INT NOT NULL,
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          ADD CONSTRAINT fk_company_user_type FOREIGN KEY (user_type_id) REFERENCES usertypes(user_type_id),
          ADD CONSTRAINT fk_company_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id);
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
            address TEXT NOT NULL,
            user_type_id INT NOT NULL,
            vendor_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_type_id) REFERENCES usertypes(user_type_id),
            FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
          );
        `,
        alter: `
          ALTER TABLE consumers
          MODIFY COLUMN name VARCHAR(255) NOT NULL,
          MODIFY COLUMN email VARCHAR(255) NOT NULL UNIQUE,
          MODIFY COLUMN phone_number VARCHAR(20) NOT NULL,
          MODIFY COLUMN address TEXT NOT NULL,
          MODIFY COLUMN user_type_id INT NOT NULL,
          MODIFY COLUMN vendor_id INT NOT NULL,
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          ADD CONSTRAINT fk_consumer_user_type FOREIGN KEY (user_type_id) REFERENCES usertypes(user_type_id),
          ADD CONSTRAINT fk_consumer_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id);
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
            user_type_id INT NOT NULL,
            reset_token VARCHAR(255) NULL,
            reset_token_expiry DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(role_id),
            FOREIGN KEY (user_type_id) REFERENCES usertypes(user_type_id)
          );
        `,
        alter: `
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL UNIQUE,
          ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) NULL,
          ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
          ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME NULL;
        `
      }
    ];

    // Process each table
    for (const table of tables) {
      try {
        // First check if table exists (case-insensitive)
        const [results] = await sequelize.query(
          `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = '${sequelize.config.database}' 
           AND LOWER(table_name) = LOWER('${table.name}')`
        );

        if (results[0].count === 0) {
          // Table doesn't exist, create it
          console.log(`Creating table ${table.name}...`);
          try {
            await sequelize.query(table.create);
            console.log(`Table ${table.name} created successfully`);
          } catch (createError) {
            if (createError.original && createError.original.code === 'ER_TABLESPACE_EXISTS') {
              // If tablespace exists, try to drop and recreate
              console.log(`Tablespace exists for ${table.name}, attempting to drop and recreate...`);
              try {
                // First try to drop the table normally
                await sequelize.query(`DROP TABLE IF EXISTS ${table.name}`);
                await sequelize.query(table.create);
                console.log(`Table ${table.name} recreated successfully`);
              } catch (dropError) {
                console.error(`Error dropping table ${table.name}:`, dropError.message);
                // If normal drop fails, try to recreate the table with a different name
                const tempTableName = `${table.name}_temp`;
                try {
                  await sequelize.query(`DROP TABLE IF EXISTS ${tempTableName}`);
                  await sequelize.query(table.create.replace(table.name, tempTableName));
                  await sequelize.query(`DROP TABLE IF EXISTS ${table.name}`);
                  await sequelize.query(`RENAME TABLE ${tempTableName} TO ${table.name}`);
                  console.log(`Table ${table.name} recreated successfully using temporary table`);
                } catch (tempError) {
                  console.error(`Error recreating table using temporary table:`, tempError.message);
                  throw tempError;
                }
              }
            } else {
              throw createError;
            }
          }
        } else {
          // Table exists, try to alter it
          console.log(`Table ${table.name} exists, attempting to alter...`);
          try {
            await sequelize.query(table.alter);
            console.log(`Table ${table.name} altered successfully`);
          } catch (alterError) {
            console.log(`Could not alter table ${table.name}, but it exists:`, alterError.message);
          }
        }
      } catch (error) {
        console.error(`Error processing table ${table.name}:`, error.message);
        throw error;
      }
    }

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
      { permission_name: 'view_user' },
      { permission_name: 'edit_user' },
      { permission_name: 'create_vendor' },
      { permission_name: 'delete_vendor' },
      { permission_name: 'view_vendor' },
      { permission_name: 'edit_vendor' },
      { permission_name: 'manage_roles' },
      { permission_name: 'manage_permissions' }
    ];

    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { permission_name: permission.permission_name },
        defaults: permission
      });
    }

    // Assign all permissions to Admin role
    const adminRole = await Role.findOne({ where: { role_name: 'Admin' } });
    const allPermissions = await Permission.findAll();
    
    for (const permission of allPermissions) {
      await RolePermission.findOrCreate({
        where: {
          role_id: adminRole.id,
          permission_id: permission.id
        }
      });
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = initializeDatabase;