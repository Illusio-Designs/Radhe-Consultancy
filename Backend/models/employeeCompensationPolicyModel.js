// EmployeeCompensationPolicy Model
// This model represents employee compensation insurance policies.
// It includes relations to Company and InsuranceCompany, and stores GST, gross premium, and remarks.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const InsuranceCompany = require('./insuranceCompanyModel');
const Company = require('./companyModel');

const EmployeeCompensationPolicy = sequelize.define('EmployeeCompensationPolicy', {
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
      model: 'InsuranceCompanies',
      key: 'id'
    }
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'company_id'
    }
  },
  policy_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  policy_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  policy_end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  medical_cover: {
    type: DataTypes.ENUM('25k', '50k', '1 lac', '2 lac', '3 lac', '5 lac', 'actual'),
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
  tableName: 'employee_compensation_policies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = EmployeeCompensationPolicy; 