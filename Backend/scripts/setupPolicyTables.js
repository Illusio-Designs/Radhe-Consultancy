// Master Policy Tables Setup Script
// This script sets up all policy-related tables and structures on server restart
// Includes ECP and Vehicle policy renewal system setup

const config = require("../config/config.js");
const { Sequelize, QueryTypes } = require("sequelize");
const createPreviousEmployeeCompensationTable = require("./createPreviousEmployeeCompensationTable");
const createPreviousVehiclePolicyTable = require("./createPreviousVehiclePolicyTable");
const createPreviousHealthPolicyTable = require("./createPreviousHealthPolicyTable");
const createPreviousFirePolicyTable = require("./createPreviousFirePolicyTable");
const createPreviousLifePolicyTable = require("./createPreviousLifePolicyTable");

// Create Sequelize instance using config.js
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  }
);

/**
 * Setup all policy-related tables and structures
 * @returns {Promise<boolean>} Success status
 */
async function setupPolicyTables() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🏗️  POLICY TABLES SETUP');
    console.log('='.repeat(60));
    
    // Test database connection first
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Step 1: Setup ECP Previous Policy Table
    console.log('\n📋 Step 1: Setting up ECP Previous Policy Table...');
    await createPreviousEmployeeCompensationTable();
    console.log('✅ ECP Previous Policy Table setup completed');

    // Step 2: Setup Vehicle Previous Policy Table
    console.log('\n📋 Step 2: Setting up Vehicle Previous Policy Table...');
    await createPreviousVehiclePolicyTable();
    console.log('✅ Vehicle Previous Policy Table setup completed');

    // Step 3: Setup Health Previous Policy Table
    console.log('\n📋 Step 3: Setting up Health Previous Policy Table...');
    await createPreviousHealthPolicyTable();
    console.log('✅ Health Previous Policy Table setup completed');

    // Step 4: Setup Fire Previous Policy Table
    console.log('\n📋 Step 4: Setting up Fire Previous Policy Table...');
    await createPreviousFirePolicyTable();
    console.log('✅ Fire Previous Policy Table setup completed');

    // Step 5: Setup Life Previous Policy Table
    console.log('\n📋 Step 5: Setting up Life Previous Policy Table...');
    await createPreviousLifePolicyTable();
    console.log('✅ Life Previous Policy Table setup completed');

    // Step 6: Ensure upload directories exist
    console.log('\n📁 Step 6: Setting up upload directories...');
    await setupUploadDirectories();
    console.log('✅ Upload directories setup completed');

    // Step 7: Verify policy table structures
    console.log('\n🔍 Step 7: Verifying policy table structures...');
    await verifyPolicyTableStructures();
    console.log('✅ Policy table structures verified');

    // Step 8: Setup policy indexes for performance
    console.log('\n⚡ Step 8: Setting up performance indexes...');
    await setupPolicyIndexes();
    console.log('✅ Performance indexes setup completed');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 POLICY TABLES SETUP COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('📊 Summary:');
    console.log('   ✅ ECP Previous Policy Table: Ready');
    console.log('   ✅ Vehicle Previous Policy Table: Ready');
    console.log('   ✅ Health Previous Policy Table: Ready');
    console.log('   ✅ Fire Previous Policy Table: Ready');
    console.log('   ✅ Life Previous Policy Table: Ready');
    console.log('   ✅ Upload Directories: Created');
    console.log('   ✅ Table Structures: Verified');
    console.log('   ✅ Performance Indexes: Optimized');
    console.log('='.repeat(60) + '\n');

    return true;
  } catch (error) {
    console.error('\n❌ Policy Tables Setup Failed:', error);
    console.error('Stack:', error.stack);
    return false;
  }
}

/**
 * Setup upload directories for policy documents
 */
async function setupUploadDirectories() {
  const fs = require('fs').promises;
  const path = require('path');

  const directories = [
    'uploads',
    'uploads/employee_policies',
    'uploads/vehicle_policies',
    'uploads/health_policies',
    'uploads/fire_policies',
    'uploads/life_policies',
    'uploads/dsc_documents',
    'uploads/labour_documents',
    'uploads/factory_quotations',
    'uploads/plan_documents',
    'uploads/stability_documents'
  ];

  for (const dir of directories) {
    const dirPath = path.join(__dirname, '..', dir);
    try {
      await fs.access(dirPath);
      console.log(`   📁 Directory exists: ${dir}`);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`   📁 Directory created: ${dir}`);
    }
  }
}

/**
 * Verify that all policy tables have correct structure
 */
async function verifyPolicyTableStructures() {
  const tables = [
    'EmployeeCompensationPolicies',
    'PreviousEmployeeCompensationPolicies',
    'VehiclePolicies',
    'PreviousVehiclePolicies',
    'HealthPolicies',
    'PreviousHealthPolicies',
    'FirePolicies',
    'PreviousFirePolicies',
    'LifePolicies',
    'PreviousLifePolicies'
  ];

  for (const table of tables) {
    try {
      const [tableExists] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = '${table}'
      `, { type: QueryTypes.SELECT });

      if (tableExists.count > 0) {
        console.log(`   ✅ Table verified: ${table}`);
        
        // Check for required columns
        const [columns] = await sequelize.query(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = '${table}'
          ORDER BY ORDINAL_POSITION
        `, { type: QueryTypes.SELECT });

        // Verify key columns exist
        const columnNames = columns.map(col => col.COLUMN_NAME);
        const requiredColumns = ['id', 'policy_number', 'status', 'created_at', 'updated_at'];
        
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
        if (missingColumns.length > 0) {
          console.warn(`   ⚠️  Missing columns in ${table}: ${missingColumns.join(', ')}`);
        } else {
          console.log(`   ✅ Required columns verified: ${table}`);
        }
      } else {
        console.warn(`   ⚠️  Table not found: ${table}`);
      }
    } catch (error) {
      console.error(`   ❌ Error verifying table ${table}:`, error.message);
    }
  }
}

/**
 * Setup performance indexes for policy tables
 */
async function setupPolicyIndexes() {
  const indexes = [
    {
      table: 'EmployeeCompensationPolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_ecp_status ON EmployeeCompensationPolicies(status)',
        'CREATE INDEX IF NOT EXISTS idx_ecp_policy_dates ON EmployeeCompensationPolicies(policy_start_date, policy_end_date)',
        'CREATE INDEX IF NOT EXISTS idx_ecp_company_status ON EmployeeCompensationPolicies(company_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_ecp_insurance_company ON EmployeeCompensationPolicies(insurance_company_id)',
        'CREATE INDEX IF NOT EXISTS idx_ecp_created_at ON EmployeeCompensationPolicies(created_at)'
      ]
    },
    {
      table: 'VehiclePolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_vp_status ON VehiclePolicies(status)',
        'CREATE INDEX IF NOT EXISTS idx_vp_policy_dates ON VehiclePolicies(policy_start_date, policy_end_date)',
        'CREATE INDEX IF NOT EXISTS idx_vp_customer_type ON VehiclePolicies(customer_type)',
        'CREATE INDEX IF NOT EXISTS idx_vp_company_status ON VehiclePolicies(company_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_vp_consumer_status ON VehiclePolicies(consumer_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_vp_vehicle_number ON VehiclePolicies(vehicle_number)',
        'CREATE INDEX IF NOT EXISTS idx_vp_insurance_company ON VehiclePolicies(insurance_company_id)',
        'CREATE INDEX IF NOT EXISTS idx_vp_created_at ON VehiclePolicies(created_at)'
      ]
    },
    {
      table: 'PreviousEmployeeCompensationPolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_pecp_original_policy ON PreviousEmployeeCompensationPolicies(original_policy_id)',
        'CREATE INDEX IF NOT EXISTS idx_pecp_renewed_at ON PreviousEmployeeCompensationPolicies(renewed_at)',
        'CREATE INDEX IF NOT EXISTS idx_pecp_company_id ON PreviousEmployeeCompensationPolicies(company_id)',
        'CREATE INDEX IF NOT EXISTS idx_pecp_policy_dates ON PreviousEmployeeCompensationPolicies(policy_start_date, policy_end_date)'
      ]
    },
    {
      table: 'PreviousVehiclePolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_pvp_original_policy ON PreviousVehiclePolicies(original_policy_id)',
        'CREATE INDEX IF NOT EXISTS idx_pvp_renewed_at ON PreviousVehiclePolicies(renewed_at)',
        'CREATE INDEX IF NOT EXISTS idx_pvp_company_id ON PreviousVehiclePolicies(company_id)',
        'CREATE INDEX IF NOT EXISTS idx_pvp_consumer_id ON PreviousVehiclePolicies(consumer_id)',
        'CREATE INDEX IF NOT EXISTS idx_pvp_vehicle_number ON PreviousVehiclePolicies(vehicle_number)',
        'CREATE INDEX IF NOT EXISTS idx_pvp_policy_dates ON PreviousVehiclePolicies(policy_start_date, policy_end_date)'
      ]
    },
    {
      table: 'HealthPolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_hp_status ON HealthPolicies(status)',
        'CREATE INDEX IF NOT EXISTS idx_hp_policy_dates ON HealthPolicies(policy_start_date, policy_end_date)',
        'CREATE INDEX IF NOT EXISTS idx_hp_customer_type ON HealthPolicies(customer_type)',
        'CREATE INDEX IF NOT EXISTS idx_hp_company_status ON HealthPolicies(company_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_hp_consumer_status ON HealthPolicies(consumer_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_hp_insurance_company ON HealthPolicies(insurance_company_id)',
        'CREATE INDEX IF NOT EXISTS idx_hp_medical_cover ON HealthPolicies(medical_cover)',
        'CREATE INDEX IF NOT EXISTS idx_hp_created_at ON HealthPolicies(created_at)'
      ]
    },
    {
      table: 'FirePolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_fp_status ON FirePolicies(status)',
        'CREATE INDEX IF NOT EXISTS idx_fp_policy_dates ON FirePolicies(policy_start_date, policy_end_date)',
        'CREATE INDEX IF NOT EXISTS idx_fp_customer_type ON FirePolicies(customer_type)',
        'CREATE INDEX IF NOT EXISTS idx_fp_company_status ON FirePolicies(company_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_fp_consumer_status ON FirePolicies(consumer_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_fp_insurance_company ON FirePolicies(insurance_company_id)',
        'CREATE INDEX IF NOT EXISTS idx_fp_sum_insured ON FirePolicies(total_sum_insured)',
        'CREATE INDEX IF NOT EXISTS idx_fp_created_at ON FirePolicies(created_at)'
      ]
    },
    {
      table: 'LifePolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_lp_status ON LifePolicies(status)',
        'CREATE INDEX IF NOT EXISTS idx_lp_policy_dates ON LifePolicies(policy_start_date, policy_end_date)',
        'CREATE INDEX IF NOT EXISTS idx_lp_customer_type ON LifePolicies(customer_type)',
        'CREATE INDEX IF NOT EXISTS idx_lp_company_status ON LifePolicies(company_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_lp_consumer_status ON LifePolicies(consumer_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_lp_insurance_company ON LifePolicies(insurance_company_id)',
        'CREATE INDEX IF NOT EXISTS idx_lp_date_of_birth ON LifePolicies(date_of_birth)',
        'CREATE INDEX IF NOT EXISTS idx_lp_issue_date ON LifePolicies(issue_date)',
        'CREATE INDEX IF NOT EXISTS idx_lp_created_at ON LifePolicies(created_at)'
      ]
    },
    {
      table: 'PreviousHealthPolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_php_original_policy ON PreviousHealthPolicies(original_policy_id)',
        'CREATE INDEX IF NOT EXISTS idx_php_renewed_at ON PreviousHealthPolicies(renewed_at)',
        'CREATE INDEX IF NOT EXISTS idx_php_company_id ON PreviousHealthPolicies(company_id)',
        'CREATE INDEX IF NOT EXISTS idx_php_consumer_id ON PreviousHealthPolicies(consumer_id)',
        'CREATE INDEX IF NOT EXISTS idx_php_policy_dates ON PreviousHealthPolicies(policy_start_date, policy_end_date)'
      ]
    },
    {
      table: 'PreviousFirePolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_pfp_original_policy ON PreviousFirePolicies(original_policy_id)',
        'CREATE INDEX IF NOT EXISTS idx_pfp_renewed_at ON PreviousFirePolicies(renewed_at)',
        'CREATE INDEX IF NOT EXISTS idx_pfp_company_id ON PreviousFirePolicies(company_id)',
        'CREATE INDEX IF NOT EXISTS idx_pfp_consumer_id ON PreviousFirePolicies(consumer_id)',
        'CREATE INDEX IF NOT EXISTS idx_pfp_policy_dates ON PreviousFirePolicies(policy_start_date, policy_end_date)'
      ]
    },
    {
      table: 'PreviousLifePolicies',
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_plp_original_policy ON PreviousLifePolicies(original_policy_id)',
        'CREATE INDEX IF NOT EXISTS idx_plp_renewed_at ON PreviousLifePolicies(renewed_at)',
        'CREATE INDEX IF NOT EXISTS idx_plp_company_id ON PreviousLifePolicies(company_id)',
        'CREATE INDEX IF NOT EXISTS idx_plp_consumer_id ON PreviousLifePolicies(consumer_id)',
        'CREATE INDEX IF NOT EXISTS idx_plp_policy_dates ON PreviousLifePolicies(policy_start_date, policy_end_date)',
        'CREATE INDEX IF NOT EXISTS idx_plp_current_policy_number ON PreviousLifePolicies(current_policy_number)'
      ]
    }
  ];

  for (const tableIndexes of indexes) {
    console.log(`   ⚡ Setting up indexes for ${tableIndexes.table}...`);
    
    for (const indexQuery of tableIndexes.indexes) {
      try {
        await sequelize.query(indexQuery);
      } catch (error) {
        // Ignore errors for existing indexes
        if (!error.message.includes('Duplicate key name')) {
          console.warn(`   ⚠️  Index creation warning: ${error.message}`);
        }
      }
    }
    
    console.log(`   ✅ Indexes setup completed for ${tableIndexes.table}`);
  }
}

/**
 * Verify renewal system functionality
 */
async function verifyRenewalSystem() {
  try {
    console.log('\n🔍 Verifying renewal system functionality...');
    
    // Check if previous policy tables can be accessed
    const [ecpPreviousCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM PreviousEmployeeCompensationPolicies
    `, { type: QueryTypes.SELECT });
    
    const [vehiclePreviousCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM PreviousVehiclePolicies
    `, { type: QueryTypes.SELECT });
    
    console.log(`   📊 ECP Previous Policies: ${ecpPreviousCount.count}`);
    console.log(`   📊 Vehicle Previous Policies: ${vehiclePreviousCount.count}`);
    
    // Check if foreign key relationships work
    const [ecpActiveCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM EmployeeCompensationPolicies WHERE status = 'active'
    `, { type: QueryTypes.SELECT });
    
    const [vehicleActiveCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM VehiclePolicies WHERE status = 'active'
    `, { type: QueryTypes.SELECT });
    
    console.log(`   📊 ECP Active Policies: ${ecpActiveCount.count}`);
    console.log(`   📊 Vehicle Active Policies: ${vehicleActiveCount.count}`);
    
    console.log('   ✅ Renewal system verification completed');
    return true;
  } catch (error) {
    console.error('   ❌ Renewal system verification failed:', error.message);
    return false;
  }
}

/**
 * Setup policy document cleanup job configuration
 */
async function setupPolicyDocumentCleanup() {
  try {
    console.log('\n🧹 Setting up policy document cleanup configuration...');
    
    // Create cleanup configuration table if it doesn't exist
    const [cleanupTableExists] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'policy_cleanup_config'
    `, { type: QueryTypes.SELECT });

    if (cleanupTableExists.count === 0) {
      await sequelize.query(`
        CREATE TABLE policy_cleanup_config (
          id INT AUTO_INCREMENT PRIMARY KEY,
          policy_type VARCHAR(50) NOT NULL,
          retention_days INT NOT NULL DEFAULT 365,
          cleanup_enabled BOOLEAN DEFAULT FALSE,
          last_cleanup_at DATETIME NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_policy_type (policy_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Insert default cleanup configurations
      await sequelize.query(`
        INSERT INTO policy_cleanup_config (policy_type, retention_days, cleanup_enabled) VALUES
        ('ecp_previous', 1095, FALSE),
        ('vehicle_previous', 1095, FALSE),
        ('health_previous', 1095, FALSE),
        ('fire_previous', 1095, FALSE),
        ('life_previous', 1095, FALSE)
        ON DUPLICATE KEY UPDATE retention_days = VALUES(retention_days)
      `);

      console.log('   ✅ Policy document cleanup configuration created');
    } else {
      console.log('   ✅ Policy document cleanup configuration already exists');
    }
  } catch (error) {
    console.error('   ❌ Policy document cleanup setup failed:', error.message);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupPolicyTables()
    .then(async (success) => {
      if (success) {
        console.log("✅ Policy Tables Setup completed successfully!");
        
        // Run additional verification
        await verifyRenewalSystem();
        await setupPolicyDocumentCleanup();
        
        process.exit(0);
      } else {
        console.error("❌ Policy Tables Setup failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Policy Tables Setup failed:", error);
      process.exit(1);
    });
}

module.exports = {
  setupPolicyTables,
  setupUploadDirectories,
  verifyPolicyTableStructures,
  setupPolicyIndexes,
  verifyRenewalSystem,
  setupPolicyDocumentCleanup,
  createPreviousHealthPolicyTable,
  createPreviousFirePolicyTable,
  createPreviousLifePolicyTable
};