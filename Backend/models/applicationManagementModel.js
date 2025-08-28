const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ApplicationManagement = sequelize.define('ApplicationManagement', {
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
  compliance_manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  },
  status: {
    type: DataTypes.ENUM('application', 'submit', 'Approved', 'Reject'),
    allowNull: false,
    defaultValue: 'application'
  },
  application_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date when application is submitted'
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Manual expiry date set by compliance manager'
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
  tableName: 'application_management',
  timestamps: true,
  underscored: true
});

module.exports = ApplicationManagement; 