const sequelize = require('./sequelize');

// Import models
const User = require('./userModel');
const Role = require('./roleModel');
const Permission = require('./permissionModel');
const RolePermission = require('./rolePermissionModel');
const Vendor = require('./vendorModel');
const Company = require('./companyModel');
const Consumer = require('./consumerModel');
const UserType = require('./userTypeModel');

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

User.belongsTo(UserType, { foreignKey: 'user_type_id' });
UserType.hasMany(User, { foreignKey: 'user_type_id' });

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

Vendor.hasOne(Company, { foreignKey: 'vendor_id' });
Company.belongsTo(Vendor, { foreignKey: 'vendor_id' });

Vendor.hasOne(Consumer, { foreignKey: 'vendor_id' });
Consumer.belongsTo(Vendor, { foreignKey: 'vendor_id' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Vendor,
  Company,
  Consumer,
  UserType
};