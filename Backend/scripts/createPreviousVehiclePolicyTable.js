// Migration Script: Create PreviousVehiclePolicies table
// This script creates a new table to store previous/expired vehicle policies
// and adds previous_policy_id column to VehiclePolicies table

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

async function createPreviousVehiclePolicyTable() {
  try {
    // Test database connection first
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    console.log(
      "🔄 Starting PreviousVehiclePolicies table creation..."
    );

    // Check if PreviousVehiclePolicies table exists
    const [tableExists] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'PreviousVehiclePolicies'
    `,
      { type: QueryTypes.SELECT }
    );

    if (tableExists.count === 0) {
      console.log("📝 Creating PreviousVehiclePolicies table...");
      await sequelize.query(`
        CREATE TABLE PreviousVehiclePolicies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          original_policy_id INT NULL COMMENT 'Reference to the original policy ID before it was moved to previous',
          business_type ENUM('Fresh/New', 'Renewal/Rollover', 'Endorsement') NOT NULL,
          customer_type ENUM('Organisation', 'Individual') NOT NULL,
          insurance_company_id INT NOT NULL,
          company_id INT NULL,
          consumer_id INT NULL,
          organisation_or_holder_name VARCHAR(255) NOT NULL,
          policy_number VARCHAR(255) NOT NULL,
          email VARCHAR(255) NULL,
          mobile_number VARCHAR(255) NULL,
          policy_start_date DATE NOT NULL,
          policy_end_date DATE NOT NULL,
          sub_product ENUM('Two Wheeler', 'Private car', 'Passanger Vehicle', 'Goods Vehicle', 'Misc - D Vehicle', 'Standalone CPA') NOT NULL,
          vehicle_number VARCHAR(255) NOT NULL,
          segment ENUM('Comprehensive', 'TP Only', 'SAOD') NOT NULL,
          manufacturing_company VARCHAR(255) NOT NULL,
          model VARCHAR(255) NOT NULL,
          manufacturing_year VARCHAR(255) NOT NULL,
          idv DECIMAL(12, 2) NOT NULL,
          net_premium DECIMAL(10, 2) NOT NULL,
          gst DECIMAL(10, 2) NOT NULL,
          gross_premium DECIMAL(10, 2) NOT NULL,
          policy_document_path VARCHAR(255) NULL,
          remarks TEXT NULL,
          status ENUM('active', 'expired', 'cancelled') DEFAULT 'expired' COMMENT 'Status when the policy was moved to previous (usually expired)',
          renewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date when this policy was renewed and moved to previous',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_company_id (company_id),
          INDEX idx_consumer_id (consumer_id),
          INDEX idx_insurance_company_id (insurance_company_id),
          INDEX idx_policy_end_date (policy_end_date),
          INDEX idx_original_policy_id (original_policy_id),
          INDEX idx_renewed_at (renewed_at),
          FOREIGN KEY (insurance_company_id) REFERENCES InsuranceCompanies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
          FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE RESTRICT ON UPDATE CASCADE,
          FOREIGN KEY (consumer_id) REFERENCES Consumers(consumer_id) ON DELETE RESTRICT ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log(
        "✅ PreviousVehiclePolicies table created successfully"
      );
    } else {
      console.log(
        "ℹ️  PreviousVehiclePolicies table already exists"
      );
    }

    // Check if previous_policy_id column exists in VehiclePolicies
    const [previousPolicyIdExists] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'VehiclePolicies' 
      AND COLUMN_NAME = 'previous_policy_id'
    `,
      { type: QueryTypes.SELECT }
    );

    if (previousPolicyIdExists.count === 0) {
      console.log(
        "📝 Adding previous_policy_id column to VehiclePolicies..."
      );
      await sequelize.query(`
        ALTER TABLE VehiclePolicies 
        ADD COLUMN previous_policy_id INT NULL COMMENT 'Reference to the previous policy ID that was renewed (if this is a renewal)',
        ADD INDEX idx_previous_policy_id (previous_policy_id)
      `);
      console.log("✅ previous_policy_id column added successfully");
    } else {
      console.log("ℹ️  previous_policy_id column already exists");
    }

    console.log(
      "✅ PreviousVehiclePolicies table setup completed successfully!"
    );
    console.log("📊 Summary:");
    console.log(
      "   - PreviousVehiclePolicies table: Created (or already exists)"
    );
    console.log("   - previous_policy_id column: Added (or already exists)");
  } catch (error) {
    console.error(
      "❌ Error creating PreviousVehiclePolicies table:",
      error
    );
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  createPreviousVehiclePolicyTable()
    .then(() => {
      console.log("✅ Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}

module.exports = createPreviousVehiclePolicyTable;

