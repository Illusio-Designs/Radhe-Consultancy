const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const InsuranceCompany = require('./insuranceCompanyModel');
const Company = require('./companyModel');
const Consumer = require('./consumerModel');

const FirePolicy = sequelize.define('FirePolicy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  business_type: {
    type: DataTypes.ENUM('Fresh/New', 'Renewal/Rollover', 'Endorsement'),
    allowNull: false
  },
  customer_type: {
    type: DataTypes.ENUM('Organisation', 'Individual'),
    allowNull: false
  },
  insurance_company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: InsuranceCompany,
      key: 'id'
    }
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Company,
      key: 'company_id'
    }
  },
  consumer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Consumer,
      key: 'consumer_id'
    }
  },
  proposer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  policy_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  policy_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  policy_end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  total_sum_insured: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  gst_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pan_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  net_premium: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  gst: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  gross_premium: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  policy_document_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'active'
  }
}, {
  tableName: 'FirePolicies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  modelName: 'FirePolicy',
  indexes: [
    {
      unique: true,
      fields: ['policy_number']
    }
  ]
});

module.exports = FirePolicy; 