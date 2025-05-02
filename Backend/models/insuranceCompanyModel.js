const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InsuranceCompany = sequelize.define('InsuranceCompany', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'InsuranceCompanies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InsuranceCompany; 