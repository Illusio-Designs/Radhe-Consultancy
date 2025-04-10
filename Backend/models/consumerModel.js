const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Consumer = sequelize.define('Consumer', {
  consumer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vendors',
      key: 'vendor_id'
    }
  },
  // ... rest of the fields remain the same ...
}, {
  tableName: 'Consumers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Consumer;