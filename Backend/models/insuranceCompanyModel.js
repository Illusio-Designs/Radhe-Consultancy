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
    allowNull: false
  }
}, {
  tableName: 'InsuranceCompanies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  modelName: 'InsuranceCompany',
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
});

module.exports = InsuranceCompany; 