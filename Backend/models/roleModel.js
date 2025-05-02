const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['user', 'admin', 'vendor_manager', 'user_manager', 'company', 'consumer', 'insurance_manager']]
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Roles',
  timestamps: false,
});

module.exports = Role;