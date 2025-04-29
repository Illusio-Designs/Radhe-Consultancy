const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const Company = sequelize.define('Company', {
  company_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  owner_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  owner_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contact_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  gst_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  pan_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  firm_type: {
    type: DataTypes.ENUM('Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Limited', 'Trust'),
    allowNull: false
  },
  nature_of_work: {
    type: DataTypes.STRING,
    allowNull: false
  },
  factory_license_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  labour_license_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type_of_company: {
    type: DataTypes.ENUM('Industries', 'Contractor', 'School', 'Hospital', 'Service'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active'
  },
  gst_document: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pan_document: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gst_document_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pan_document_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  }
}, {
  tableName: 'companies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Company.belongsTo(User, { foreignKey: 'user_id' });

// Add indexes after model definition
Company.afterSync(async () => {
  try {
    // Check if indexes exist before creating them
    const [results] = await sequelize.query(
      "SELECT COUNT(*) as count FROM information_schema.statistics WHERE table_schema = ? AND table_name = 'companies' AND index_name = 'idx_gst_number'",
      { replacements: [sequelize.config.database], type: sequelize.QueryTypes.SELECT }
    );
    
    if (results.count === 0) {
      await sequelize.query('CREATE INDEX idx_gst_number ON companies (gst_number)');
      console.log('Created index idx_gst_number on companies table');
    }
    
    const [panResults] = await sequelize.query(
      "SELECT COUNT(*) as count FROM information_schema.statistics WHERE table_schema = ? AND table_name = 'companies' AND index_name = 'idx_pan_number'",
      { replacements: [sequelize.config.database], type: sequelize.QueryTypes.SELECT }
    );
    
    if (panResults.count === 0) {
      await sequelize.query('CREATE INDEX idx_pan_number ON companies (pan_number)');
      console.log('Created index idx_pan_number on companies table');
    }
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
});

module.exports = Company;