const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DSC = sequelize.define('DSC', {
  dsc_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Companies',
      key: 'company_id'
    }
  },
  consumer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Consumers',
      key: 'consumer_id'
    }
  },
  certification_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('in', 'out'),
    allowNull: false,
    defaultValue: 'in'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'DSCs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DSC; 