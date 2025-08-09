// Combined Database Initialization, Seeding, and Admin Setup Script
// This script handles database setup, roles/permissions setup, and admin user setup

const { User, Role, UserRole, Company, Consumer, InsuranceCompany, EmployeeCompensationPolicy, VehiclePolicy, HealthPolicy, FirePolicy, LifePolicy, DSC, ReminderLog, DSCLog, UserRoleWorkLog } = require('../models');
const sequelize = require('../config/db');
const FactoryQuotation = require('../models/factoryQuotationModel');
const PlanManagement = require('../models/planManagementModel');
const StabilityManagement = require('../models/stabilityManagementModel');
const ApplicationManagement = require('../models/applicationManagementModel');
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
  { role_name: 'DSC_manager', description: 'Digital Signature Certificate management access' },
  { role_name: 'Plan_manager', description: 'Plan management access' },
  { role_name: 'Stability_manager', description: 'Stability management access' }
];

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
 * Drops permission tables if they exist
 * @returns {Promise<void>}
 */
async function dropPermissionTables() {
  try {
    console.log('🔄 Dropping permission tables if they exist...');
    
    // Drop the tables if they exist
    await sequelize.query('DROP TABLE IF EXISTS RolePermissions');
    console.log('✅ RolePermissions table dropped (if existed)');
    
    await sequelize.query('DROP TABLE IF EXISTS Permissions');
    console.log('✅ Permissions table dropped (if existed)');
    
    console.log('✅ Permission tables cleanup completed');
  } catch (error) {
    console.error('❌ Error dropping permission tables:', error);
  }
}

/**
 * Sets up the database with all required tables
 * @returns {Promise<boolean>}
 */
async function setupDatabase() {
  try {
    logToFile('Setting up database...');
    console.log('Setting up database...');

    // Drop permission tables first (these are the only ones we want to remove)
    await dropPermissionTables();

    // Sync tables in correct order (minimal logging) - use alter: true to preserve existing data
    console.log('🔄 Syncing database tables...');
    
    try {
      await Role.sync({ alter: true });
      console.log('✅ Role table synced');
    } catch (error) {
      console.log('⚠️  Role table sync warning:', error.message);
    }

    try {
      await User.sync({ alter: true });
      console.log('✅ User table synced');
      } catch (error) {
      console.log('⚠️  User table sync warning:', error.message);
      }

      try {
          // Skip UserRole sync if table already exists to preserve existing data
    try {
      await UserRole.sync({ alter: true });
      console.log('✅ UserRole table synced');
      } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ UserRole table already exists - preserving existing data');
      } else {
        throw error;
      }
    }
      } catch (error) {
      console.log('⚠️  UserRole table sync warning:', error.message);
    }

    // Sync other tables with error handling
    const otherTables = [
      { model: Company, name: 'Company' },
      { model: Consumer, name: 'Consumer' },
      { model: InsuranceCompany, name: 'InsuranceCompany' },
      { model: EmployeeCompensationPolicy, name: 'EmployeeCompensationPolicy' },
      { model: VehiclePolicy, name: 'VehiclePolicy' },
      { model: HealthPolicy, name: 'HealthPolicy' },
      { model: FirePolicy, name: 'FirePolicy' },
      { model: LifePolicy, name: 'LifePolicy' },
      { model: DSC, name: 'DSC' },
      { model: ReminderLog, name: 'ReminderLog' },
      { model: DSCLog, name: 'DSCLog' },
      { model: UserRoleWorkLog, name: 'UserRoleWorkLog' },
      { model: FactoryQuotation, name: 'FactoryQuotation' },
      { model: PlanManagement, name: 'PlanManagement' },
      { model: StabilityManagement, name: 'StabilityManagement' },
      { model: ApplicationManagement, name: 'ApplicationManagement' }
    ];

    for (const table of otherTables) {
      try {
        await table.model.sync({ alter: true });
        console.log(`✅ ${table.name} table synced`);
      } catch (error) {
        console.log(`⚠️  ${table.name} table sync warning:`, error.message);
      }
    }

    logToFile('Database setup completed');
    console.log('✅ Database setup completed');
    return true;
  } catch (error) {
    const errorMessage = `Database setup error: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    return false;
  }
}

/**
 * Sets up roles in the database
 * @returns {Promise<boolean>}
 */
async function setupRolesAndPermissions() {
  try {
    logToFile('Setting up roles...');
    console.log('Setting up roles...');
    
    // Create roles
    for (const role of roles) {
      await Role.findOrCreate({
        where: { role_name: role.role_name },
        defaults: role
      });
    }
    logToFile('Roles setup completed');
    console.log('Roles setup completed');

    return true;
  } catch (error) {
    const errorMessage = `Error setting up roles: ${error.message}`;
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
 * Sets up plan manager users
 * @returns {Promise<boolean>} Success status
 */
async function setupPlanManagers() {
  try {
    logToFile('Setting up plan managers...');
    console.log('Setting up plan managers...');
    
    const planManagerRole = await Role.findOne({ where: { role_name: 'Plan_manager' } });
    if (!planManagerRole) {
      throw new Error('Plan_manager role not found');
    }

    const planManagers = [
      {
        username: 'Green Arc',
        email: 'greenarc@radheconsultancy.co.in',
        password: 'GreenArc@123'
      },
      {
        username: 'Little Star',
        email: 'littlestar@radheconsultancy.co.in',
        password: 'LittleStar@123'
      }
    ];

    for (const manager of planManagers) {
      const [user, created] = await User.findOrCreate({
        where: { email: manager.email },
        defaults: {
          username: manager.username,
          password: manager.password,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      if (!created) {
        // Update existing user
        await user.update({
          password: manager.password,
          updated_at: new Date()
        });
      }

      // Check if user already has plan manager role
      const existingUserRole = await UserRole.findOne({
        where: {
          user_id: user.user_id,
          role_id: planManagerRole.id
        }
      });

      if (!existingUserRole) {
        // Assign plan manager role
        await user.addRole(planManagerRole, { 
          through: { 
            is_primary: true,
            assigned_by: 1 // Admin user ID
          } 
        });
        logToFile(`Plan manager role assigned to ${manager.username}`);
        console.log(`Plan manager role assigned to ${manager.username}`);
      }
    }

    logToFile('Plan managers setup completed');
    console.log('Plan managers setup completed');
    return true;
  } catch (error) {
    const errorMessage = `Error setting up plan managers: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    return false;
  }
}

/**
 * Sets up stability manager users
 * @returns {Promise<boolean>} Success status
 */
async function setupStabilityManagers() {
  try {
    logToFile('Setting up stability managers...');
    console.log('Setting up stability managers...');
    
    const stabilityManagerRole = await Role.findOne({ where: { role_name: 'Stability_manager' } });
    if (!stabilityManagerRole) {
      throw new Error('Stability_manager role not found');
    }

    const stabilityManagers = [
      {
        username: 'Jayeshbhai A Kataria',
        email: 'jayeshbhai@radheconsultancy.co.in',
        password: 'Jayeshbhai@123'
      },
      {
        username: 'Samir G. Davda',
        email: 'samir@radheconsultancy.co.in',
        password: 'Samir@123'
      }
    ];

    for (const manager of stabilityManagers) {
      const [user, created] = await User.findOrCreate({
        where: { email: manager.email },
        defaults: {
          username: manager.username,
          password: manager.password,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      if (!created) {
        // Update existing user
        await user.update({
          password: manager.password,
          updated_at: new Date()
        });
      }

      // Check if user already has stability manager role
      const existingUserRole = await UserRole.findOne({
        where: {
          user_id: user.user_id,
          role_id: stabilityManagerRole.id
        }
      });

      if (!existingUserRole) {
        // Assign stability manager role
        await user.addRole(stabilityManagerRole, { 
          through: { 
            is_primary: true,
            assigned_by: 1 // Admin user ID
          } 
        });
        logToFile(`Stability manager role assigned to ${manager.username}`);
        console.log(`Stability manager role assigned to ${manager.username}`);
      }
    }

    logToFile('Stability managers setup completed');
    console.log('Stability managers setup completed');
    return true;
  } catch (error) {
    const errorMessage = `Error setting up stability managers: ${error.message}`;
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

    // Setup admin user
    const adminSetup = await setupAdminUser();
    if (!adminSetup) {
      throw new Error('Admin user setup failed');
    }

    // Setup plan managers
    const planManagersSetup = await setupPlanManagers();
    if (!planManagersSetup) {
      throw new Error('Plan managers setup failed');
    }

    // Setup stability managers
    const stabilityManagersSetup = await setupStabilityManagers();
    if (!stabilityManagersSetup) {
      throw new Error('Stability managers setup failed');
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