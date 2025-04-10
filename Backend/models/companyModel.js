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
  // ... rest of the fields remain the same ...
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Company;