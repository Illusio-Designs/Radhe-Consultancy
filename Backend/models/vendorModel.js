const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Vendor = sequelize.define('Vendor', {
  vendor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vendor_type: {
    type: DataTypes.ENUM('Company', 'Consumer'),
    allowNull: false
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Vendors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Vendor; 