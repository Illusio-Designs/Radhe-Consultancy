const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ReminderLog = sequelize.define('ReminderLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  policy_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  policy_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'ReminderLogs',
  timestamps: false
});

module.exports = ReminderLog; 