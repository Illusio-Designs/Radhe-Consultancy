const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserType = sequelize.define('UserType', {
  user_type_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type_name: {
    type: DataTypes.ENUM('Office', 'Company', 'Consumer'),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'usertypes',
  timestamps: false
});

module.exports = UserType; // Ensure this export exists