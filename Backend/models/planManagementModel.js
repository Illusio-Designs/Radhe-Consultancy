const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlanManagement = sequelize.define('PlanManagement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  factory_quotation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'FactoryQuotations',
      key: 'id'
    }
  },
  plan_manager_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  },
  status: {
    type: DataTypes.ENUM('plan', 'submit', 'Approved', 'Reject'),
    allowNull: false,
    defaultValue: 'plan'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Remarks for rejection or approval'
  },
  files: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of file metadata for uploaded files'
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When plan manager submitted the work'
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When admin reviewed and approved/rejected'
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'user_id'
    },
    comment: 'Admin who reviewed the plan'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'plan_management',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['factory_quotation_id']
    },
    {
      fields: ['plan_manager_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = PlanManagement; 