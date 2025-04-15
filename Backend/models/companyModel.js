const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

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
  company_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contact_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  company_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  gst_number: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  pan_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  firm_type: {
    type: DataTypes.ENUM('Proprietorship', 'Partnership', 'LLP', 'Private Limited'),
    allowNull: false
  },
  company_website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
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