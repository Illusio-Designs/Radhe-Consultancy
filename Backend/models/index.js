const sequelize = require('./sequelize');

// Import models
const User = require('./userModel');
const Role = require('./roleModel');
const Permission = require('./permissionModel');
const RolePermission = require('./rolePermissionModel');
const Vendor = require('./vendorModel');
const CompanyVendor = require('./companyVendorModel');
const ConsumerVendor = require('./consumerVendorModel');

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

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

Vendor.hasOne(CompanyVendor, { foreignKey: 'vendor_id' });
CompanyVendor.belongsTo(Vendor, { foreignKey: 'vendor_id' });

Vendor.hasOne(ConsumerVendor, { foreignKey: 'vendor_id' });
ConsumerVendor.belongsTo(Vendor, { foreignKey: 'vendor_id' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Vendor,
  CompanyVendor,
  ConsumerVendor
}; 