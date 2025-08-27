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
      isIn: [['Admin', 'User', 'Vendor_manager', 'User_manager', 'Company', 'Consumer', 'Insurance_manager', 'Compliance_manager', 'DSC_manager', 'Plan_manager', 'Stability_manager', 'Website_manager', 'Labour_law_manager']]
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Roles',
  timestamps: false,
  modelName: 'Role'
});

module.exports = Role;