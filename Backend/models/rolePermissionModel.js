const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const RolePermission = sequelize.define('RolePermission', {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Roles',
      key: 'role_id'
    }
  },
  permission_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Permissions',
      key: 'permission_id'
    }
  }
}, {
  tableName: 'RolePermissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RolePermission; 