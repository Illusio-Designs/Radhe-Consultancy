// Backend/models/permissionModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ensure this path is correct

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  permission_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'Permissions',
  timestamps: false, // Assuming you don't need createdAt/updatedAt for this table
  modelName: 'Permission'
});

module.exports = Permission;