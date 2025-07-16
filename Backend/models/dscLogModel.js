const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DSCLog = sequelize.define('DSCLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dsc_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM('create', 'update'),
    allowNull: false,
  },
  performed_by: {
    type: DataTypes.INTEGER, // user id
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT, // JSON string or text
    allowNull: true,
  },
}, {
  tableName: 'dsc_logs',
  timestamps: true,
});

// Association will be set in models/index.js
module.exports = DSCLog; 