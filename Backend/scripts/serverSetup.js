// Combined Database Initialization, Seeding, and Admin Setup Script
// This script handles database setup, roles/permissions setup, and admin user setup

const { User, Role, UserRole, Company, Consumer, InsuranceCompany, EmployeeCompensationPolicy, VehiclePolicy, HealthPolicies, FirePolicy, LifePolicy, DSC, ReminderLog, DSCLog, UserRoleWorkLog, LabourInspection, LabourLicense, RenewalConfig } = require('../models');
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
  { role_name: 'Stability_manager', description: 'Stability management access' },
  { role_name: 'Website_manager', description: 'Website management and content access' },
  { role_name: 'Labour_law_manager', description: 'Labour law and inspection management access' }
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

// Add connection retry logic
async function ensureDatabaseConnection() {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection verified');
      return true;
    } catch (error) {
      retries++;
      console.log(`⚠️  Database connection attempt ${retries} failed: ${error.message}`);
      if (retries < maxRetries) {
        console.log('🔄 Retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
      }
    }
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

    // Ensure database connection is stable
    await ensureDatabaseConnection();

    // Drop permission tables first (these are the only ones we want to remove)
    await dropPermissionTables();

    // Sync tables in correct order with connection verification
    console.log('🔄 Syncing database tables...');
    
    try {
      await ensureDatabaseConnection();
      await Role.sync({ alter: true });
      console.log('✅ Role table synced');
    } catch (error) {
      console.log('⚠️  Role table sync warning:', error.message);
    }

    try {
      await ensureDatabaseConnection();
      await User.sync({ alter: true });
      console.log('✅ User table synced');
    } catch (error) {
      console.log('⚠️  User table sync warning:', error.message);
    }

    try {
      // Skip UserRole sync if table already exists to preserve existing data
      await ensureDatabaseConnection();
      await UserRole.sync({ alter: true });
      console.log('✅ UserRole table synced');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ UserRole table already exists - preserving existing data');
      } else {
        console.log('⚠️  UserRole table sync warning:', error.message);
      }
    }

    // Sync other tables with error handling and connection verification
    const otherTables = [
      { model: Company, name: 'Company' },
      { model: Consumer, name: 'Consumer' },
      { model: InsuranceCompany, name: 'InsuranceCompany' },
      { model: EmployeeCompensationPolicy, name: 'EmployeeCompensationPolicy' },
      { model: VehiclePolicy, name: 'VehiclePolicy' },
      { model: HealthPolicies, name: 'HealthPolicies' },
      { model: FirePolicy, name: 'FirePolicy' },
      { model: LifePolicy, name: 'LifePolicy' },
      { model: DSC, name: 'DSC' },
      { model: ReminderLog, name: 'ReminderLog' },
      { model: DSCLog, name: 'DSCLog' },
      { model: UserRoleWorkLog, name: 'UserRoleWorkLog' },
      { model: FactoryQuotation, name: 'FactoryQuotation' },
      { model: PlanManagement, name: 'PlanManagement' },
      { model: StabilityManagement, name: 'StabilityManagement' },
      { model: ApplicationManagement, name: 'ApplicationManagement' },
      { model: LabourInspection, name: 'LabourInspection' },
      { model: LabourLicense, name: 'LabourLicense' }
    ];

    for (const table of otherTables) {
      try {
        await ensureDatabaseConnection();
        
        // Special handling for ApplicationManagement to ensure compliance_manager_id is nullable
        if (table.name === 'ApplicationManagement') {
          try {
            await table.model.sync({ alter: true });
            console.log(`✅ ${table.name} table synced`);
          } catch (syncError) {
            if (syncError.message.includes('compliance_manager_id') || syncError.message.includes('cannot be null')) {
              console.log(`🔄 ${table.name} schema issue detected, attempting to fix...`);
              try {
                await table.model.drop();
                await table.model.sync({ force: true });
                console.log(`✅ ${table.name} table recreated with correct schema`);
              } catch (dropError) {
                console.log(`⚠️ Could not recreate ${table.name} table:`, dropError.message);
              }
            } else {
              console.log(`⚠️ ${table.name} table sync warning:`, syncError.message);
            }
          }
        } else {
          await table.model.sync({ alter: true });
          console.log(`✅ ${table.name} table synced`);
        }
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

    // Only find existing admin user, don't create new ones
    const adminUser = await User.findOne({
      where: { email: 'Admin@radheconsultancy.co.in' }
    });

    if (adminUser) {
      // Update existing admin user with new name
      await adminUser.update({
        username: 'BRIJESH KANERIA',
        password: await bcrypt.hash('Admin@123', 10),
        updated_at: new Date()
      });
      logToFile('Updated existing admin user with new name: BRIJESH KANERIA');
      console.log('Updated existing admin user with new name: BRIJESH KANERIA');
    } else {
      // Skip if admin user doesn't exist - don't create new ones
      logToFile('Skipping admin user setup - user not found');
      console.log('⏭️ Skipping admin user setup - user not found');
      return true;
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
        email: 'info2greenarc@gmail.com',
        password: 'GreenArc@123'
      },
      {
        username: 'Little Star',
        email: 'littlestarcreation700@gmail.com',
        password: 'LittleStar@123'
      }
    ];

    for (const manager of planManagers) {
      try {
        // Only find existing users by username, don't create new ones
        const user = await User.findOne({
          where: { username: manager.username }
        });

        if (user) {
          // Update existing user with new email and password
          await user.update({
            email: manager.email,
            password: await bcrypt.hash(manager.password, 10),
            updated_at: new Date()
          });
          logToFile(`Updated existing plan manager: ${manager.username} with new email: ${manager.email}`);
          console.log(`Updated existing plan manager: ${manager.username} with new email: ${manager.email}`);
        } else {
          // Skip if user doesn't exist - don't create new ones
          logToFile(`Skipping plan manager ${manager.username} - user not found`);
          console.log(`⏭️ Skipping plan manager ${manager.username} - user not found`);
          continue;
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
        } else {
          logToFile(`Plan manager role already assigned to ${manager.username}`);
          console.log(`Plan manager role already assigned to ${manager.username}`);
        }
      } catch (userError) {
        logToFile(`Error setting up plan manager ${manager.username}: ${userError.message}`);
        console.error(`Error setting up plan manager ${manager.username}:`, userError);
        // Continue with other managers
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
        email: 'valuerjayeshakatira@gmail.com',
        password: 'Jayeshbhai@123'
      },
      {
        username: 'Samir G. Davda',
        email: 'littlestarcreation700@gmail.com',
        password: 'Samir@123'
      }
    ];

    for (const manager of stabilityManagers) {
      try {
        // Only find existing users by username, don't create new ones
        const user = await User.findOne({
          where: { username: manager.username }
        });

        if (user) {
          // Update existing user with new email and password
          await user.update({
            email: manager.email,
            password: await bcrypt.hash(manager.password, 10),
            updated_at: new Date()
          });
          logToFile(`Updated existing stability manager: ${manager.username} with new email: ${manager.email}`);
          console.log(`Updated existing stability manager: ${manager.username} with new email: ${manager.email}`);
        } else {
          // Skip if user doesn't exist - don't create new ones
          logToFile(`Skipping stability manager ${manager.username} - user not found`);
          console.log(`⏭️ Skipping stability manager ${manager.username} - user not found`);
          continue;
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
        } else {
          logToFile(`Stability manager role already assigned to ${manager.username}`);
          console.log(`Stability manager role already assigned to ${manager.username}`);
        }
      } catch (userError) {
        logToFile(`Error setting up stability manager ${manager.username}: ${userError.message}`);
        console.error(`Error setting up stability manager ${manager.username}:`, userError);
        // Continue with other managers
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



// Renewal Management System setup function
async function setupRenewalSystem() {
  try {
    console.log('🔧 Setting up Renewal Management System...');
    
    // Check if RenewalConfig table exists and create it
    const [configResults] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'renewal_configs'
    `);
    
    if (configResults[0].count === 0) {
      console.log('📋 Creating renewal_configs table...');
      await sequelize.query(`
        CREATE TABLE renewal_configs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          service_type VARCHAR(100) NOT NULL,
          service_name VARCHAR(255) NOT NULL,
          reminder_times INT NOT NULL,
          reminder_days INT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_by INT NOT NULL,
          updated_by INT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_service_type (service_type),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ renewal_configs table created successfully');
    } else {
      console.log('📋 renewal_configs table already exists, checking structure...');
      
      // Check if table has correct structure, if not, drop and recreate
      try {
        const [columns] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'renewal_configs' 
          AND TABLE_SCHEMA = DATABASE()
        `);
        
        const columnNames = columns.map(col => col.COLUMN_NAME);
        const requiredColumns = ['id', 'service_type', 'service_name', 'reminder_times', 'reminder_days', 'is_active', 'created_by', 'updated_by', 'created_at', 'updated_at'];
        
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length > 0 || columnNames.includes('serviceType')) {
          console.log('📋 Table structure incorrect, dropping and recreating...');
          await sequelize.query('DROP TABLE IF EXISTS renewal_configs');
          
          await sequelize.query(`
            CREATE TABLE renewal_configs (
              id INT AUTO_INCREMENT PRIMARY KEY,
              service_type VARCHAR(100) NOT NULL,
              service_name VARCHAR(255) NOT NULL,
              reminder_times INT NOT NULL,
              reminder_days INT NOT NULL,
              is_active BOOLEAN NOT NULL DEFAULT TRUE,
              created_by INT NOT NULL,
              updated_by INT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY unique_service_type (service_type),
              INDEX idx_is_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          console.log('✅ renewal_configs table recreated with correct structure');
        } else {
          console.log('✅ renewal_configs table structure is correct');
        }
      } catch (error) {
        console.log('⚠️ Error checking table structure:', error.message);
      }
    }
    
    // Check if ReminderLogs table exists and enhance it
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'ReminderLogs'
    `);
    
    if (results[0].count === 0) {
      console.log('📋 Creating ReminderLogs table...');
      await sequelize.query(`
        CREATE TABLE ReminderLogs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          policy_id INT NOT NULL,
          policy_type VARCHAR(50) NOT NULL,
          client_name VARCHAR(255),
          client_email VARCHAR(255),
          reminder_type ENUM('email', 'sms', 'whatsapp') DEFAULT 'email',
          reminder_day INT NOT NULL DEFAULT 0,
          expiry_date DATETIME,
          sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          status ENUM('sent', 'delivered', 'failed', 'opened', 'clicked') DEFAULT 'sent',
          email_subject VARCHAR(500),
          response_data JSON,
          error_message TEXT,
          days_until_expiry INT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_policy (policy_id, policy_type),
          INDEX idx_sent_at (sent_at),
          INDEX idx_status (status),
          INDEX idx_reminder_type (reminder_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ ReminderLogs table created successfully');
    } else {
      console.log('📋 Enhancing existing ReminderLogs table...');
      
      // Add new columns if they don't exist
      const columns = [
        { name: 'client_name', sql: 'ADD COLUMN client_name VARCHAR(255)' },
        { name: 'client_email', sql: 'ADD COLUMN client_email VARCHAR(255)' },
        { name: 'reminder_type', sql: 'ADD COLUMN reminder_type ENUM(\'email\', \'sms\', \'whatsapp\') DEFAULT \'email\'' },
        { name: 'reminder_day', sql: 'ADD COLUMN reminder_day INT NOT NULL DEFAULT 0' },
        { name: 'expiry_date', sql: 'ADD COLUMN expiry_date DATETIME' },
        { name: 'status', sql: 'ADD COLUMN status ENUM(\'sent\', \'delivered\', \'failed\', \'opened\', \'clicked\') DEFAULT \'sent\'' },
        { name: 'email_subject', sql: 'ADD COLUMN email_subject VARCHAR(500)' },
        { name: 'response_data', sql: 'ADD COLUMN response_data JSON' },
        { name: 'error_message', sql: 'ADD COLUMN error_message TEXT' },
        { name: 'createdAt', sql: 'ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updatedAt', sql: 'ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
      ];
      
      for (const column of columns) {
        try {
          await sequelize.query(`ALTER TABLE ReminderLogs ${column.sql}`);
          console.log(`✅ Added column: ${column.name}`);
        } catch (error) {
          if (error.message.includes('Duplicate column name')) {
            console.log(`⏭️ Column ${column.name} already exists`);
          } else {
            console.log(`⚠️ Error adding column ${column.name}:`, error.message);
          }
        }
      }
      
      // Add indexes if they don't exist
      const indexes = [
        { name: 'idx_policy', sql: 'ADD INDEX idx_policy (policy_id, policy_type)' },
        { name: 'idx_sent_at', sql: 'ADD INDEX idx_sent_at (sent_at)' },
        { name: 'idx_status', sql: 'ADD INDEX idx_status (status)' },
        { name: 'idx_reminder_type', sql: 'ADD INDEX idx_reminder_type (reminder_type)' }
      ];
      
      for (const index of indexes) {
        try {
          await sequelize.query(`ALTER TABLE ReminderLogs ${index.sql}`);
          console.log(`✅ Added index: ${index.name}`);
        } catch (error) {
          if (error.message.includes('Duplicate key name')) {
            console.log(`⏭️ Index ${index.name} already exists`);
          } else {
            console.log(`⚠️ Error adding index ${index.name}:`, error.message);
          }
        }
      }
    }
    
    // Create default renewal configurations if they don't exist
    console.log('📋 Setting up default renewal configurations...');
    const defaultConfigs = [
      { serviceType: 'vehicle', serviceName: 'Vehicle Insurance', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'ecp', serviceName: 'Employee Compensation Policy', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'health', serviceName: 'Health Insurance', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'fire', serviceName: 'Fire Insurance', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'dsc', serviceName: 'Digital Signature Certificate', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'factory', serviceName: 'Factory Quotation', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'labour_inspection', serviceName: 'Labour Inspection', reminderTimes: 5, reminderDays: 15 },
      { serviceType: 'labour_license', serviceName: 'Labour License', reminderTimes: 3, reminderDays: 30 }
    ];
    
    for (const config of defaultConfigs) {
      try {
        const existingConfig = await RenewalConfig.findOne({
          where: { serviceType: config.serviceType }
        });
        
        if (!existingConfig) {
          await RenewalConfig.create({
            serviceType: config.serviceType,
            serviceName: config.serviceName,
            reminderTimes: config.reminderTimes,
            reminderDays: config.reminderDays,
            createdBy: 1, // Admin user ID
            isActive: true
          });
          console.log(`✅ Created default config for ${config.serviceName}`);
        } else {
          console.log(`⏭️ Config for ${config.serviceName} already exists`);
        }
      } catch (error) {
        console.log(`⚠️ Error creating config for ${config.serviceName}:`, error.message);
      }
    }
    
    console.log('✅ Renewal Management System setup completed!');
  } catch (error) {
    console.error('❌ Error setting up Renewal Management System:', error);
  }
}

// Ensure ApplicationManagement schema is properly synced
async function ensureApplicationManagementSchema() {
  try {
    console.log('📋 Ensuring ApplicationManagement schema is correct...');
    
    // Force sync the ApplicationManagement model to ensure schema matches
    try {
      await ensureDatabaseConnection();
      await ApplicationManagement.sync({ alter: true, force: false });
      console.log('✅ ApplicationManagement schema synced successfully');
    } catch (error) {
      console.log('⚠️ ApplicationManagement sync warning:', error.message);
      
      // If alter fails, try to drop and recreate the table (only if it's safe)
      if (error.message.includes('compliance_manager_id') || error.message.includes('cannot be null')) {
        console.log('🔄 Attempting to fix ApplicationManagement schema...');
        try {
          // Drop the table and recreate it with correct schema
          await ApplicationManagement.drop();
          await ApplicationManagement.sync({ force: true });
          console.log('✅ ApplicationManagement table recreated with correct schema');
        } catch (dropError) {
          console.log('⚠️ Could not recreate table:', dropError.message);
        }
      }
    }
    
    console.log('✅ ApplicationManagement schema verification completed!');
  } catch (error) {
    console.error('❌ Error ensuring ApplicationManagement schema:', error);
  }
}

// Verify that all required roles exist
async function verifyRequiredRoles() {
  try {
    logToFile('Verifying required roles exist...');
    console.log('Verifying required roles exist...');
    
    const requiredRoles = [
      'Admin',
      'Plan_manager', 
      'Stability_manager',
      'Website_manager',
      'Labour_law_manager'
    ];
    
    const missingRoles = [];
    
    for (const roleName of requiredRoles) {
      const role = await Role.findOne({ where: { role_name: roleName } });
      if (!role) {
        missingRoles.push(roleName);
        logToFile(`Missing role: ${roleName}`);
        console.log(`Missing role: ${roleName}`);
      } else {
        logToFile(`Role found: ${roleName} (ID: ${role.id})`);
        console.log(`Role found: ${roleName} (ID: ${role.id})`);
      }
    }
    
    if (missingRoles.length > 0) {
      throw new Error(`Missing required roles: ${missingRoles.join(', ')}`);
    }
    
    logToFile('All required roles verified successfully');
    console.log('All required roles verified successfully');
    return true;
  } catch (error) {
    const errorMessage = `Error verifying roles: ${error.message}`;
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

    // Verify that all required roles exist
    const rolesVerified = await verifyRequiredRoles();
    if (!rolesVerified) {
      throw new Error('Required roles verification failed');
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

    // Ensure ApplicationManagement schema is correct
    await ensureApplicationManagementSchema();



    // Setup stability managers
    const stabilityManagersSetup = await setupStabilityManagers();
    if (!stabilityManagersSetup) {
      throw new Error('Stability managers setup failed');
    }



    // Add this section for Renewal Management System setup
    await setupRenewalSystem();



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
  setupPlanManagers,
  setupStabilityManagers,
  verifyRequiredRoles,
  setupRenewalSystem,
  setupAll
};



// Run setup if this file is run directly
if (require.main === module) {
  setupAll();
} 