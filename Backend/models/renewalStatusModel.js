const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RenewalStatus = sequelize.define('RenewalStatus', {
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
  upload_option: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Upload option files and details'
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Expiry date for the renewal'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id'
    },
    comment: 'User who created this renewal status record'
  }
}, {
  tableName: 'renewal_status',
  timestamps: true,
  underscored: true
});

module.exports = RenewalStatus;
