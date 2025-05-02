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
    allowNull: false
  },
  gst_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pan_number: {
    type: DataTypes.STRING,
    allowNull: false
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

module.exports = Company;