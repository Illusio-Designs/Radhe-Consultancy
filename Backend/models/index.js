const sequelize = require('../config/db');

// Import models
const User = require('./userModel');
const Role = require('./roleModel');
const Permission = require('./permissionModel');
const RolePermission = require('./rolePermissionModel');
const Company = require('./companyModel');
const Consumer = require('./consumerModel');
const InsuranceCompany = require('./InsuranceCompany');
const EmployeeCompensationPolicy = require('./EmployeeCompensationPolicy');

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

// Insurance Company and Policy associations
InsuranceCompany.hasMany(EmployeeCompensationPolicy, {
  foreignKey: 'insuranceCompanyId',
  as: 'employeeCompensationPolicies'
});

EmployeeCompensationPolicy.belongsTo(InsuranceCompany, {
  foreignKey: 'insuranceCompanyId',
  as: 'provider'
});

// Company and Policy associations
Company.hasMany(EmployeeCompensationPolicy, {
  foreignKey: 'companyId',
  as: 'employeePolicies'
});

EmployeeCompensationPolicy.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'policyHolder'
});

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Company,
  Consumer,
  InsuranceCompany,
  EmployeeCompensationPolicy
};