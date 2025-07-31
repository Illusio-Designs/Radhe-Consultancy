const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StabilityManagement = sequelize.define('StabilityManagement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  factory_quotation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'FactoryQuotations',
      key: 'id'
    }
  },
  stability_manager_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  },
  status: {
    type: DataTypes.ENUM('stability', 'submit', 'Approved', 'Reject'),
    allowNull: false,
    defaultValue: 'stability'
  },
  load_type: {
    type: DataTypes.ENUM('with_load', 'without_load'),
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  files: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  }
}, {
  tableName: 'stability_management',
  timestamps: true,
  underscored: true
});

module.exports = StabilityManagement; 