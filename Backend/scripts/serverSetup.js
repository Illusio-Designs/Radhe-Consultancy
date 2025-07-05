// Combined Database Initialization, Seeding, and Admin Setup Script
// This script handles database setup, roles/permissions setup, and admin user setup

const { sequelize, User, Role, Permission, RolePermission, UserRole, Company, Consumer, InsuranceCompany, EmployeeCompensationPolicy, VehiclePolicy, HealthPolicy, FirePolicy, LifePolicy, DSC } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const serverLogPath = path.join(logsDir, 'server.log');

// Logging function
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFile(serverLogPath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

// Role definitions
const roles = [
  { role_name: 'Admin', description: 'Full system access' },
  { role_name: 'User', description: 'Basic user access' },
  { role_name: 'Vendor_manager', description: 'Vendor management access' },
  { role_name: 'User_manager', description: 'User management access' },
  { role_name: 'Company', description: 'Company access' },
  { role_name: 'Consumer', description: 'Consumer access' },
  { role_name: 'Insurance_manager', description: 'Insurance management access' },
  { role_name: 'Compliance_manager', description: 'Compliance management access' },
  { role_name: 'DSC_manager', description: 'Digital Signature Certificate management access' }
];

// Permission definitions
const permissions = [
  // User Management
  { permission_name: 'view_users' },
  { permission_name: 'create_user' },
  { permission_name: 'edit_user' },
  { permission_name: 'delete_user' },
  // Company Management
  { permission_name: 'view_companies' },
  { permission_name: 'create_company' },
  { permission_name: 'edit_company' },
  { permission_name: 'delete_company' },
  { permission_name: 'upload_company_documents' },
  // Consumer Management
  { permission_name: 'view_consumers' },
  { permission_name: 'create_consumer' },
  { permission_name: 'edit_consumer' },
  { permission_name: 'delete_consumer' },
  // Role Management
  { permission_name: 'view_roles' },
  { permission_name: 'assign_roles' },
  // System Access
  { permission_name: 'access_dashboard' },
  { permission_name: 'access_reports' },
  { permission_name: 'access_settings' },
  // Insurance Management
  { permission_name: 'view_insurance_companies' },
  { permission_name: 'create_insurance_company' },
  { permission_name: 'edit_insurance_company' },
  { permission_name: 'delete_insurance_company' },
  { permission_name: 'view_policies' },
  { permission_name: 'create_policy' },
  { permission_name: 'edit_policy' },
  { permission_name: 'delete_policy' }
];

// Role-Permission mappings
const rolePermissions = {
  'Admin': permissions.map(p => p.permission_name), // All permissions
  'User': [ 'access_dashboard' ],
  'Vendor_manager': [
    'view_companies', 'create_company', 'edit_company', 'delete_company',
    'view_consumers', 'create_consumer', 'edit_consumer', 'delete_consumer',
    'access_dashboard', 'access_reports', 'upload_company_documents'
  ],
  'User_manager': [
    'view_users', 'create_user', 'edit_user', 'delete_user',
    'view_roles', 'assign_roles', 'access_dashboard'
  ],
  'Company': [
    'access_dashboard',
    'view_companies', 'edit_company',
    'upload_company_documents'
  ],
  'Consumer': [
    'access_dashboard',
    'view_consumers', 'edit_consumer'
  ],
  'Insurance_manager': [
    'access_dashboard',
    'view_insurance_companies',
    'create_insurance_company',
    'edit_insurance_company',
    'delete_insurance_company',
    'view_policies',
    'create_policy',
    'edit_policy',
    'delete_policy',
    'access_reports'
  ],
  'Compliance_manager': [
    'access_dashboard',
    'view_companies',
    'view_consumers',
    'view_insurance_companies',
    'view_policies',
    'access_reports'
  ],
  'DSC_manager': [
    'access_dashboard',
    'view_users',
    'edit_user',
    'access_reports'
  ]
};

// Handle LifePolicy table setup
async function setupLifePolicyTable(sequelize) {
  try {
    // Drop existing indexes
    await sequelize.query(`
      ALTER TABLE LifePolicies
      DROP INDEX idx_policy_number,
      DROP INDEX idx_insurance_company,
      DROP INDEX idx_company,
      DROP INDEX idx_consumer,
      DROP INDEX idx_policy_dates;
    `).catch(err => {
      // Ignore errors if indexes don't exist
      console.log('Note: Some indexes may not exist, continuing...');
    });

    // Drop foreign keys
    await sequelize.query(`
      ALTER TABLE LifePolicies
      DROP FOREIGN KEY fk_insurance_company,
      DROP FOREIGN KEY fk_company,
      DROP FOREIGN KEY fk_consumer;
    `).catch(err => {
      // Ignore errors if foreign keys don't exist
      console.log('Note: Some foreign keys may not exist, continuing...');
    });

    // Add new constraints and indexes
    await sequelize.query(`
      ALTER TABLE LifePolicies
      ADD CONSTRAINT fk_insurance_company
      FOREIGN KEY (insurance_company_id)
      REFERENCES InsuranceCompanies(id)
      ON DELETE NO ACTION
      ON UPDATE CASCADE,
      ADD CONSTRAINT fk_company
      FOREIGN KEY (company_id)
      REFERENCES Companies(company_id)
      ON DELETE NO ACTION
      ON UPDATE CASCADE,
      ADD CONSTRAINT fk_consumer
      FOREIGN KEY (consumer_id)
      REFERENCES Consumers(consumer_id)
      ON DELETE NO ACTION
      ON UPDATE CASCADE;
    `).catch(err => {
      console.log('Note: Some constraints may already exist, continuing...');
    });

    // Add indexes
    await sequelize.query(`
      ALTER TABLE LifePolicies
      ADD UNIQUE INDEX idx_policy_number (current_policy_number),
      ADD INDEX idx_policy_dates (policy_start_date, issue_date);
    `).catch(err => {
      console.log('Note: Some indexes may already exist, continuing...');
    });

    console.log('LifePolicy table synced with constraints and indexes');
  } catch (error) {
    console.error('Error setting up LifePolicy table:', error);
    throw error;
  }
}

async function setupConsumerTable(sequelize) {
  try {
    // Drop existing indexes
    await sequelize.query(`
      ALTER TABLE Consumers
      DROP INDEX email,
      DROP INDEX user_id;
    `).catch(err => {
      // Ignore errors if indexes don't exist
      console.log('Note: Some indexes may not exist, continuing...');
    });

    // Drop foreign key
    await sequelize.query(`
      ALTER TABLE Consumers
      DROP FOREIGN KEY consumers_ibfk_1;
    `).catch(err => {
      // Ignore errors if foreign key doesn't exist
      console.log('Note: Foreign key may not exist, continuing...');
    });

    // Add new foreign key and index
    await sequelize.query(`
      ALTER TABLE Consumers
      ADD CONSTRAINT fk_consumer_user
      FOREIGN KEY (user_id)
      REFERENCES Users(user_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      ADD UNIQUE INDEX idx_consumer_email (email);
    `).catch(err => {
      console.log('Note: Some constraints may already exist, continuing...');
    });

    console.log('Consumer table synced with constraints and indexes');
  } catch (error) {
    console.error('Error setting up Consumer table:', error);
    throw error;
  }
}

/**
 * Sets up the database structure and required directories
 * @returns {Promise<boolean>} Success status
 */
async function setupDatabase() {
  try {
    logToFile('Starting database setup...');
    console.log('Starting database setup...');
    
    await sequelize.authenticate();
    logToFile('Database connection established');
    console.log('Database connection established');

    // Create uploads directories if needed
    const uploadDir = path.join(__dirname, '../uploads/company_documents');
    const policyDir = path.join(__dirname, '../uploads/policies');
    const dscDir = path.join(__dirname, '../uploads/dsc');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!fs.existsSync(policyDir)) fs.mkdirSync(policyDir, { recursive: true });
    if (!fs.existsSync(dscDir)) fs.mkdirSync(dscDir, { recursive: true });

    // Disable foreign key checks temporarily
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    try {
      // Sync tables in correct order
      await Role.sync({ alter: true });
      logToFile('Roles table synced');
      await Permission.sync({ alter: true });
      logToFile('Permissions table synced');
      await RolePermission.sync({ alter: true });
      logToFile('RolePermissions table synced');
      await User.sync({ alter: true });
      logToFile('Users table synced');
      await UserRole.sync({ alter: true });
      logToFile('UserRoles table synced');

      await Consumer.sync({ alter: true });
      logToFile('Consumers table synced');

      await Company.sync({ alter: true });
      logToFile('Companies table synced');
      await InsuranceCompany.sync({ alter: true });
      logToFile('InsuranceCompanies table synced');
      
      // Sync policy tables with error handling
      try {
        await EmployeeCompensationPolicy.sync({ alter: true });
        logToFile('EmployeeCompensationPolicies table synced');
      } catch (error) {
        logToFile('Warning: EmployeeCompensationPolicy sync failed: ' + error.message);
        console.log('Warning: EmployeeCompensationPolicy sync failed:', error.message);
      }

      try {
        await VehiclePolicy.sync({ alter: true });
        logToFile('VehiclePolicies table synced');
      } catch (error) {
        logToFile('Warning: VehiclePolicy sync failed: ' + error.message);
        console.log('Warning: VehiclePolicy sync failed:', error.message);
      }

      try {
        await HealthPolicy.sync({ alter: true });
        logToFile('HealthPolicies table synced');
      } catch (error) {
        logToFile('Warning: HealthPolicy sync failed: ' + error.message);
        console.log('Warning: HealthPolicy sync failed:', error.message);
      }

      try {
        await FirePolicy.sync({ alter: true });
        logToFile('FirePolicies table synced');
      } catch (error) {
        logToFile('Warning: FirePolicy sync failed: ' + error.message);
        console.log('Warning: FirePolicy sync failed:', error.message);
      }

      // LifePolicy will be handled separately with special constraints
      logToFile('LifePolicies table will be handled separately');
      
      try {
        await DSC.sync({ alter: true });
        logToFile('DSCs table synced');
      } catch (error) {
        logToFile('Warning: DSC sync failed: ' + error.message);
        console.log('Warning: DSC sync failed:', error.message);
      }

      // Sync ReminderLog table
      try {
        const ReminderLog = require('../models/reminderLogModel');
        await ReminderLog.sync({ alter: true });
        logToFile('ReminderLogs table synced');
      } catch (error) {
        logToFile('Warning: ReminderLog sync failed: ' + error.message);
        console.log('Warning: ReminderLog sync failed:', error.message);
      }

      // Special handling for LifePolicy - try to sync without constraints first
      try {
        // First, try to sync the basic table structure
        await LifePolicy.sync({ 
          alter: true,
          logging: false
        });
        logToFile('LifePolicy basic table structure synced');
        console.log('LifePolicy basic table structure synced');
        
        // Then try to add constraints one by one
        try {
          await sequelize.query(`
            ALTER TABLE LifePolicies
            ADD CONSTRAINT fk_insurance_company
            FOREIGN KEY (insurance_company_id)
            REFERENCES InsuranceCompanies(id)
            ON DELETE NO ACTION
            ON UPDATE CASCADE
          `);
          logToFile('LifePolicy insurance company constraint added');
        } catch (err) {
          logToFile('Warning: Could not add insurance company constraint: ' + err.message);
          console.log('Warning: Could not add insurance company constraint:', err.message);
        }

        try {
          await sequelize.query(`
            ALTER TABLE LifePolicies
            ADD CONSTRAINT fk_company
            FOREIGN KEY (company_id)
            REFERENCES Companies(company_id)
            ON DELETE NO ACTION
            ON UPDATE CASCADE
          `);
          logToFile('LifePolicy company constraint added');
        } catch (err) {
          logToFile('Warning: Could not add company constraint: ' + err.message);
          console.log('Warning: Could not add company constraint:', err.message);
        }

        try {
          await sequelize.query(`
            ALTER TABLE LifePolicies
            ADD CONSTRAINT fk_consumer
            FOREIGN KEY (consumer_id)
            REFERENCES Consumers(consumer_id)
            ON DELETE NO ACTION
            ON UPDATE CASCADE
          `);
          logToFile('LifePolicy consumer constraint added');
        } catch (err) {
          logToFile('Warning: Could not add consumer constraint: ' + err.message);
          console.log('Warning: Could not add consumer constraint:', err.message);
        }

        // Add indexes if they don't exist
        try {
          await sequelize.query(`
            ALTER TABLE LifePolicies
            ADD UNIQUE INDEX idx_policy_number (current_policy_number)
          `);
          logToFile('LifePolicy policy number index added');
        } catch (err) {
          logToFile('Warning: Could not add policy number index: ' + err.message);
          console.log('Warning: Could not add policy number index:', err.message);
        }

        try {
          await sequelize.query(`
            ALTER TABLE LifePolicies
            ADD INDEX idx_policy_dates (policy_start_date, issue_date)
          `);
          logToFile('LifePolicy policy dates index added');
        } catch (err) {
          logToFile('Warning: Could not add policy dates index: ' + err.message);
          console.log('Warning: Could not add policy dates index:', err.message);
        }
        
        logToFile('LifePolicy table setup completed');
        console.log('LifePolicy table setup completed');
      } catch (error) {
        logToFile('Error syncing LifePolicy: ' + error.message);
        console.error('Error syncing LifePolicy:', error.message);
        // Continue with setup even if LifePolicy fails
      }

    } finally {
      // Re-enable foreign key checks
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    }
    
    logToFile('All tables synced successfully');
    console.log('All tables synced');

    return true;
  } catch (error) {
    const errorMessage = `Error during database setup: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    if (error.message && error.message.includes('Foreign key constraint is incorrectly formed')) {
      console.error('Please check your foreign key definitions in the FirePolicies or related models.');
    }
    return false;
  }
}

/**
 * Sets up roles and permissions in the database
 * @returns {Promise<boolean>} Success status
 */
async function setupRolesAndPermissions() {
  try {
    logToFile('Setting up roles and permissions...');
    console.log('Setting up roles and permissions...');
    
    // Update existing roles to capitalized format
    const existingRoles = await Role.findAll();
    for (const role of existingRoles) {
      const capitalizedRole = role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1);
      if (capitalizedRole !== role.role_name) {
        await role.update({ role_name: capitalizedRole });
        logToFile(`Updated role name from ${role.role_name} to ${capitalizedRole}`);
        console.log(`Updated role name from ${role.role_name} to ${capitalizedRole}`);
      }
    }
    
    // Create roles
    for (const role of roles) {
      await Role.findOrCreate({ where: { role_name: role.role_name }, defaults: role });
    }
    logToFile('Roles setup completed');
    console.log('Roles setup completed');

    // Create permissions
    for (const permission of permissions) {
      await Permission.findOrCreate({ 
        where: { permission_name: permission.permission_name }, 
        defaults: permission 
      });
    }
    logToFile('Permissions setup completed');
    console.log('Permissions setup completed');

    // Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ where: { role_name: roleName } });
      const perms = await Permission.findAll({ where: { permission_name: permissionNames } });
      
      for (const perm of perms) {
        await RolePermission.findOrCreate({ 
          where: { role_id: role.id, permission_id: perm.id } 
        });
      }
    }
    logToFile('Role-permission assignments completed');
    console.log('Role-permission assignments completed');
    return true;
  } catch (error) {
    const errorMessage = `Error setting up roles and permissions: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    return false;
  }
}

/**
 * Migrates existing users from role_id to UserRole table
 * @returns {Promise<boolean>} Success status
 */
async function migrateExistingUsers() {
  try {
    logToFile('Migrating existing users to new role system...');
    console.log('Migrating existing users to new role system...');

    // Check if role_id column still exists in Users table
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Users' 
      AND COLUMN_NAME = 'role_id'
    `);

    if (results.length === 0) {
      logToFile('role_id column not found, migration not needed');
      console.log('role_id column not found, migration not needed');
      return true;
    }

    // Get all users with role_id
    const users = await User.findAll({
      where: {
        role_id: { [sequelize.Op.not]: null }
      }
    });

    logToFile(`Found ${users.length} users to migrate`);
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      try {
        // Find the role
        const role = await Role.findByPk(user.role_id);
        if (role) {
          // Check if user-role association already exists
          const existingUserRole = await UserRole.findOne({
            where: {
              user_id: user.user_id,
              role_id: role.id
            }
          });

          if (!existingUserRole) {
            // Create the association
            await UserRole.create({
              user_id: user.user_id,
              role_id: role.id,
              is_primary: true,
              assigned_at: new Date(),
              assigned_by: user.user_id
            });
            logToFile(`Migrated user ${user.username} to role ${role.role_name}`);
            console.log(`Migrated user ${user.username} to role ${role.role_name}`);
          }
        }
      } catch (error) {
        logToFile(`Error migrating user ${user.username}: ${error.message}`);
        console.error(`Error migrating user ${user.username}:`, error.message);
      }
    }

    // Remove role_id column from Users table
    try {
      await sequelize.query('ALTER TABLE Users DROP COLUMN role_id');
      logToFile('Removed role_id column from Users table');
      console.log('Removed role_id column from Users table');
    } catch (error) {
      logToFile(`Error removing role_id column: ${error.message}`);
      console.error('Error removing role_id column:', error.message);
    }

    logToFile('User migration completed');
    console.log('User migration completed');
    return true;
  } catch (error) {
    const errorMessage = `Error migrating users: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    return false;
  }
}

/**
 * Sets up the admin user in the database
 * @returns {Promise<boolean>} Success status
 */
async function setupAdminUser() {
  try {
    logToFile('Setting up admin user...');
    console.log('Setting up admin user...');
    const adminRole = await Role.findOne({ where: { role_name: 'Admin' } });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    const [adminUser, created] = await User.findOrCreate({
      where: { email: 'Admin@radheconsultancy.co.in' },
      defaults: {
        username: 'Admin',
        password: 'Admin@123',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    if (!created) {
      // Update existing admin user
      await adminUser.update({
        password: 'Admin@123',
        updated_at: new Date()
      });
    }

    // Check if admin user already has admin role
    const existingUserRole = await UserRole.findOne({
      where: {
        user_id: adminUser.user_id,
        role_id: adminRole.id
      }
    });

    if (!existingUserRole) {
      // Assign admin role using the new association
      await adminUser.addRole(adminRole, { 
        through: { 
          is_primary: true,
          assigned_by: adminUser.user_id 
        } 
      });
      logToFile('Admin role assigned to admin user');
      console.log('Admin role assigned to admin user');
    }

    logToFile('Admin user setup completed');
    console.log('Admin user setup completed');
    return true;
  } catch (error) {
    const errorMessage = `Error setting up admin user: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    return false;
  }
}

/**
 * Runs all setup functions in sequence
 * @returns {Promise<void>}
 */
async function setupAll() {
  try {
    logToFile('Starting complete server setup...');
    console.log('Starting complete server setup...');

    // First setup database structure
    const dbSetup = await setupDatabase();
    if (!dbSetup) {
      throw new Error('Database setup failed');
    }

    // Then setup roles and permissions
    const rolesSetup = await setupRolesAndPermissions();
    if (!rolesSetup) {
      throw new Error('Roles and permissions setup failed');
    }

    // Migrate existing users to new role system
    const migrationSetup = await migrateExistingUsers();
    if (!migrationSetup) {
      throw new Error('User migration failed');
    }

    // Finally setup admin user
    const adminSetup = await setupAdminUser();
    if (!adminSetup) {
      throw new Error('Admin user setup failed');
    }

    const successMessage = 'All setup completed successfully';
    logToFile(successMessage);
    console.log(successMessage);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    const errorMessage = `Error during setup: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    await sequelize.close();
    process.exit(1);
  }
}

// Export individual functions for use in other files
module.exports = {
  setupDatabase,
  setupRolesAndPermissions,
  migrateExistingUsers,
  setupAdminUser,
  setupAll
};

// Run setup if this file is run directly
if (require.main === module) {
  setupAll();
} 