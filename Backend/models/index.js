const sequelize = require('../config/db');

// Import models
const User = require('./userModel');
const Role = require('./roleModel');
const Permission = require('./permissionModel');
const RolePermission = require('./rolePermissionModel');
const Company = require('./companyModel');
const Consumer = require('./consumerModel');

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id', targetKey: 'id' });
Role.hasMany(User, { foreignKey: 'role_id', sourceKey: 'id' });

// Many-to-many relationship between Role and Permission
Role.belongsToMany(Permission, { 
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id'
});

Permission.belongsToMany(Role, { 
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id'
});

// Company and Consumer associations
User.hasOne(Company, { foreignKey: 'user_id' });
Company.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Consumer, { foreignKey: 'user_id' });
Consumer.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Company,
  Consumer
};