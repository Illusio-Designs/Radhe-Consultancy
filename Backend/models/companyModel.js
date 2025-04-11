const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Company = sequelize.define('Company', {
  company_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vendors',
      key: 'vendor_id'
    }
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  owner_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company_email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
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
    type: DataTypes.ENUM('Proprietorship', 'Partnership', 'LLP', 'Private Limited'),
    allowNull: false
  },
  company_website: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Company;