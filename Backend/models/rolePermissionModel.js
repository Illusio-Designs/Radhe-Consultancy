const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Role = require('./roleModel');
const Permission = require('./permissionModel');

const RolePermission = sequelize.define('RolePermission', {
  role_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id',
    },
    primaryKey: true,
  },
  permission_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Permission,
      key: 'id',
    },
    primaryKey: true,
  },
}, {
  tableName: 'RolePermissions',
  timestamps: false,
  modelName: 'RolePermission'
});

// Define associations
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id' });

module.exports = RolePermission; 