// Migration Script: Create PreviousLifePolicies table
// This script creates a new table to store previous/expired life policies
// and adds previous_policy_id column to LifePolicies table

const config = require("../config/config.js");
const { Sequelize, QueryTypes } = require("sequelize");

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

async function createPreviousLifePolicyTable() {
  try {
    // Test database connection first
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    console.log(
      "🔄 Starting PreviousLifePolicies table creation..."
    );

    // Check if PreviousLifePolicies table exists
    const [tableExists] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'PreviousLifePolicies'
    `,
      { type: QueryTypes.SELECT }
    );

    if (tableExists.count === 0) {
      console.log("📝 Creating PreviousLifePolicies table...");
      await sequelize.query(`
        CREATE TABLE PreviousLifePolicies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          original_policy_id INT NULL COMMENT 'Reference to the original policy ID before it was moved to previous',
          business_type ENUM('Fresh/New', 'Renewal/Rollover', 'Endorsement') NOT NULL DEFAULT 'Fresh/New',
          customer_type ENUM('Organisation', 'Individual') NOT NULL DEFAULT 'Individual',
          insurance_company_id INT NOT NULL,
          company_id INT NULL,
          consumer_id INT NULL,
          proposer_name VARCHAR(255) NOT NULL,
          date_of_birth DATE NOT NULL,
          plan_name VARCHAR(255) NOT NULL,
          sub_product VARCHAR(255) NOT NULL,
          pt DECIMAL(10, 2) NOT NULL,
          ppt INT NOT NULL,
          policy_start_date DATE NOT NULL,
          issue_date DATE NOT NULL,
          policy_end_date DATE NOT NULL,
          current_policy_number VARCHAR(255) NOT NULL,
          email VARCHAR(255) NULL,
          mobile_number VARCHAR(255) NULL,
          net_premium DECIMAL(10, 2) NOT NULL,
          gst DECIMAL(10, 2) NOT NULL,
          gross_premium DECIMAL(10, 2) NOT NULL,
          policy_document_path VARCHAR(255) NULL,
          remarks TEXT NULL,
          status ENUM('active', 'expired', 'cancelled') DEFAULT 'expired' COMMENT 'Status when the policy was moved to previous (usually expired)',
          renewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date when this policy was renewed and moved to previous',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_current_policy_number (current_policy_number),
          INDEX idx_company_id (company_id),
          INDEX idx_consumer_id (consumer_id),
          INDEX idx_insurance_company_id (insurance_company_id),
          INDEX idx_policy_end_date (policy_end_date),
          INDEX idx_original_policy_id (original_policy_id),
          INDEX idx_renewed_at (renewed_at),
          INDEX idx_policy_dates (policy_start_date, policy_end_date),
          INDEX idx_date_of_birth (date_of_birth),
          INDEX idx_issue_date (issue_date),
          FOREIGN KEY (insurance_company_id) REFERENCES InsuranceCompanies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
          FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE RESTRICT ON UPDATE CASCADE,
          FOREIGN KEY (consumer_id) REFERENCES Consumers(consumer_id) ON DELETE RESTRICT ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log(
        "✅ PreviousLifePolicies table created successfully"
      );
    } else {
      console.log(
        "ℹ️  PreviousLifePolicies table already exists"
      );
    }

    // Check if previous_policy_id column exists in LifePolicies
    const [previousPolicyIdExists] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'LifePolicies' 
      AND COLUMN_NAME = 'previous_policy_id'
    `,
      { type: QueryTypes.SELECT }
    );

    if (previousPolicyIdExists.count === 0) {
      console.log(
        "📝 Adding previous_policy_id column to LifePolicies..."
      );
      await sequelize.query(`
        ALTER TABLE LifePolicies 
        ADD COLUMN previous_policy_id INT NULL COMMENT 'Reference to the previous policy ID that was renewed (if this is a renewal)',
        ADD INDEX idx_previous_policy_id (previous_policy_id)
      `);
      console.log("✅ previous_policy_id column added successfully");
    } else {
      console.log("ℹ️  previous_policy_id column already exists");
    }

    // Check if business_type column exists in LifePolicies
    const [businessTypeExists] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'LifePolicies' 
      AND COLUMN_NAME = 'business_type'
    `,
      { type: QueryTypes.SELECT }
    );

    if (businessTypeExists.count === 0) {
      console.log(
        "📝 Adding business_type column to LifePolicies..."
      );
      await sequelize.query(`
        ALTER TABLE LifePolicies 
        ADD COLUMN business_type ENUM('Fresh/New', 'Renewal/Rollover', 'Endorsement') NOT NULL DEFAULT 'Fresh/New' AFTER id,
        ADD INDEX idx_business_type (business_type)
      `);
      console.log("✅ business_type column added successfully");
    } else {
      console.log("ℹ️  business_type column already exists");
    }

    // Check if customer_type column exists in LifePolicies
    const [customerTypeExists] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'LifePolicies' 
      AND COLUMN_NAME = 'customer_type'
    `,
      { type: QueryTypes.SELECT }
    );

    if (customerTypeExists.count === 0) {
      console.log(
        "📝 Adding customer_type column to LifePolicies..."
      );
      await sequelize.query(`
        ALTER TABLE LifePolicies 
        ADD COLUMN customer_type ENUM('Organisation', 'Individual') NOT NULL DEFAULT 'Individual' AFTER business_type,
        ADD INDEX idx_customer_type (customer_type)
      `);
      console.log("✅ customer_type column added successfully");
    } else {
      console.log("ℹ️  customer_type column already exists");
    }

    // Check if additional fields exist in LifePolicies
    const [additionalFieldsExist] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'LifePolicies' 
      AND COLUMN_NAME IN ('proposer_name', 'email', 'mobile_number', 'net_premium', 'gst', 'gross_premium')
    `,
      { type: QueryTypes.SELECT }
    );

    if (additionalFieldsExist.count < 6) {
      console.log(
        "📝 Adding additional fields to LifePolicies..."
      );
      
      // Add proposer_name if not exists
      await sequelize.query(`
        ALTER TABLE LifePolicies 
        ADD COLUMN IF NOT EXISTS proposer_name VARCHAR(255) NOT NULL DEFAULT '' AFTER consumer_id
      `).catch(() => {});
      
      // Add email if not exists
      await sequelize.query(`
        ALTER TABLE LifePolicies 
        ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL AFTER current_policy_number
      `).catch(() => {});
      
      // Add mobile_number if not exists
      await sequelize.query(`
        ALTER TABLE LifePolicies 
        ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(255) NULL AFTER email
      `).catch(() => {});
      
      // Add net_premium if not exists
      await sequelize.query(`
        ALTER TABLE LifePolicies 
        ADD COLUMN IF NOT EXISTS net_premium DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER mobile_number
      `).catch(() => {});
      
      // Add gst if not exists
      await sequelize.query(`
        ALTER TABLE LifePolicies 
        ADD COLUMN IF NOT EXISTS gst DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER net_premium
      `).catch(() => {});
      
      // Add gross_premium if not exists
      await sequelize.query(`
        ALTER TABLE LifePolicies 
        ADD COLUMN IF NOT EXISTS gross_premium DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER gst
      `).catch(() => {});
      
      console.log("✅ Additional fields added successfully");
    } else {
      console.log("ℹ️  Additional fields already exist");
    }

    console.log(
      "✅ PreviousLifePolicies table setup completed successfully!"
    );
    console.log("📊 Summary:");
    console.log(
      "   - PreviousLifePolicies table: Created (or already exists)"
    );
    console.log("   - previous_policy_id column: Added (or already exists)");
    console.log("   - business_type column: Added (or already exists)");
    console.log("   - customer_type column: Added (or already exists)");
    console.log("   - Additional fields: Added (or already exist)");
  } catch (error) {
    console.error(
      "❌ Error creating PreviousLifePolicies table:",
      error
    );
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  createPreviousLifePolicyTable()
    .then(() => {
      console.log("✅ Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}

module.exports = createPreviousLifePolicyTable;