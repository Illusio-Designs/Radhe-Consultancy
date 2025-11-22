// Migration Script: Add renewal fields to EmployeeCompensationPolicies table
// This script adds previous_policy_id and renewed_at columns to support policy renewals

const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

async function updateEmployeeCompensationTable() {
  try {
    console.log('🔄 Starting Employee Compensation Policy table update...');
    
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

    // Add previous_policy_id column if it doesn't exist
    if (previousPolicyIdExists.count === 0) {
      console.log('📝 Adding previous_policy_id column...');
      await sequelize.query(`
        ALTER TABLE EmployeeCompensationPolicies 
        ADD COLUMN previous_policy_id INT NULL,
        ADD INDEX idx_previous_policy_id (previous_policy_id),
        ADD FOREIGN KEY (previous_policy_id) 
        REFERENCES EmployeeCompensationPolicies(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `);
      console.log('✅ previous_policy_id column added successfully');
    } else {
      console.log('ℹ️  previous_policy_id column already exists');
    }

    // Add renewed_at column if it doesn't exist
    if (renewedAtExists.count === 0) {
      console.log('📝 Adding renewed_at column...');
      await sequelize.query(`
        ALTER TABLE EmployeeCompensationPolicies 
        ADD COLUMN renewed_at DATE NULL 
        COMMENT 'Date when this policy was renewed (for tracking renewal history)'
      `);
      console.log('✅ renewed_at column added successfully');
    } else {
      console.log('ℹ️  renewed_at column already exists');
    }

    // Update status enum to include 'renewed' if it doesn't exist
    console.log('📝 Checking status enum...');
    const [statusEnum] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'EmployeeCompensationPolicies' 
      AND COLUMN_NAME = 'status'
    `, { type: QueryTypes.SELECT });

    if (statusEnum && !statusEnum.COLUMN_TYPE.includes("'renewed'")) {
      console.log('📝 Updating status enum to include "renewed"...');
      await sequelize.query(`
        ALTER TABLE EmployeeCompensationPolicies 
        MODIFY COLUMN status ENUM('active', 'expired', 'cancelled', 'renewed') 
        DEFAULT 'active'
      `);
      console.log('✅ Status enum updated successfully');
    } else {
      console.log('ℹ️  Status enum already includes "renewed" or is up to date');
    }

    console.log('✅ Employee Compensation Policy table update completed successfully!');
    console.log('📊 Summary:');
    console.log('   - previous_policy_id: Added (if needed)');
    console.log('   - renewed_at: Added (if needed)');
    console.log('   - status enum: Updated to include "renewed" (if needed)');

  } catch (error) {
    console.error('❌ Error updating Employee Compensation Policy table:', error);
    throw error;
  }
}

// Run the migration
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    await updateEmployeeCompensationTable();
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
})();

