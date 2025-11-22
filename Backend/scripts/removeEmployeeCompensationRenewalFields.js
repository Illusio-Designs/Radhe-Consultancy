// Reverse Migration Script: Remove renewal fields from EmployeeCompensationPolicies table
// This script removes previous_policy_id and renewed_at columns that were added for policy renewals

const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

async function removeEmployeeCompensationRenewalFields() {
  try {
    console.log('🔄 Starting Employee Compensation Policy table cleanup (removing renewal fields)...');
    
    // Check if previous_policy_id column exists
    const [previousPolicyIdExists] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'EmployeeCompensationPolicies' 
      AND COLUMN_NAME = 'previous_policy_id'
    `, { type: QueryTypes.SELECT });

    // Check if renewed_at column exists
    const [renewedAtExists] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'EmployeeCompensationPolicies' 
      AND COLUMN_NAME = 'renewed_at'
    `, { type: QueryTypes.SELECT });

    // Remove foreign key constraint first if it exists
    if (previousPolicyIdExists.count > 0) {
      console.log('📝 Checking for foreign key constraint...');
      const [fkExists] = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'EmployeeCompensationPolicies' 
        AND COLUMN_NAME = 'previous_policy_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `, { type: QueryTypes.SELECT });

      if (fkExists && fkExists.CONSTRAINT_NAME) {
        console.log(`📝 Dropping foreign key constraint: ${fkExists.CONSTRAINT_NAME}`);
        await sequelize.query(`
          ALTER TABLE EmployeeCompensationPolicies 
          DROP FOREIGN KEY ${fkExists.CONSTRAINT_NAME}
        `);
        console.log('✅ Foreign key constraint dropped successfully');
      }
    }

    // Remove index if it exists
    if (previousPolicyIdExists.count > 0) {
      console.log('📝 Checking for index on previous_policy_id...');
      const [indexExists] = await sequelize.query(`
        SELECT INDEX_NAME 
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'EmployeeCompensationPolicies' 
        AND COLUMN_NAME = 'previous_policy_id'
        AND INDEX_NAME != 'PRIMARY'
        LIMIT 1
      `, { type: QueryTypes.SELECT });

      if (indexExists && indexExists.INDEX_NAME) {
        console.log(`📝 Dropping index: ${indexExists.INDEX_NAME}`);
        await sequelize.query(`
          ALTER TABLE EmployeeCompensationPolicies 
          DROP INDEX ${indexExists.INDEX_NAME}
        `);
        console.log('✅ Index dropped successfully');
      }
    }

    // Remove previous_policy_id column if it exists
    if (previousPolicyIdExists.count > 0) {
      console.log('📝 Removing previous_policy_id column...');
      await sequelize.query(`
        ALTER TABLE EmployeeCompensationPolicies 
        DROP COLUMN previous_policy_id
      `);
      console.log('✅ previous_policy_id column removed successfully');
    } else {
      console.log('ℹ️  previous_policy_id column does not exist');
    }

    // Remove renewed_at column if it exists
    if (renewedAtExists.count > 0) {
      console.log('📝 Removing renewed_at column...');
      await sequelize.query(`
        ALTER TABLE EmployeeCompensationPolicies 
        DROP COLUMN renewed_at
      `);
      console.log('✅ renewed_at column removed successfully');
    } else {
      console.log('ℹ️  renewed_at column does not exist');
    }

    // Check status enum and revert if it includes 'renewed'
    console.log('📝 Checking status enum...');
    const [statusEnum] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'EmployeeCompensationPolicies' 
      AND COLUMN_NAME = 'status'
    `, { type: QueryTypes.SELECT });

    if (statusEnum && statusEnum.COLUMN_TYPE.includes("'renewed'")) {
      console.log('📝 Reverting status enum to remove "renewed"...');
      await sequelize.query(`
        ALTER TABLE EmployeeCompensationPolicies 
        MODIFY COLUMN status ENUM('active', 'expired', 'cancelled') 
        DEFAULT 'active'
      `);
      console.log('✅ Status enum reverted successfully');
    } else {
      console.log('ℹ️  Status enum does not include "renewed" or is already correct');
    }

    console.log('✅ Employee Compensation Policy table cleanup completed successfully!');
    console.log('📊 Summary:');
    console.log('   - previous_policy_id: Removed (if existed)');
    console.log('   - renewed_at: Removed (if existed)');
    console.log('   - Foreign keys and indexes: Removed (if existed)');
    console.log('   - status enum: Reverted to original (if needed)');

  } catch (error) {
    console.error('❌ Error cleaning up Employee Compensation Policy table:', error);
    throw error;
  }
}

// Run the reverse migration
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    await removeEmployeeCompensationRenewalFields();
    
    console.log('🎉 Reverse migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reverse migration failed:', error);
    process.exit(1);
  }
})();

