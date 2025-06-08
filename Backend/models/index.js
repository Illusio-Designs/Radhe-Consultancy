const sequelize = require('../config/db');

// Import models
const User = require('./userModel');
const Role = require('./roleModel');
const Permission = require('./permissionModel');
const RolePermission = require('./rolePermissionModel');
const Company = require('./companyModel');
const Consumer = require('./consumerModel');
const InsuranceCompany = require('./insuranceCompanyModel');
const EmployeeCompensationPolicy = require('./employeeCompensationPolicyModel');
const VehiclePolicy = require('./vehiclePolicyModel');
const HealthPolicy = require('./healthPolicyModel');
const FirePolicy = require('./firePolicyModel');
const LifePolicy = require('./lifePolicyModel');
const DSC = require('./dscModel');

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
  foreignKey: 'insurance_company_id',
  as: 'employeeCompensationPolicies'
});
InsuranceCompany.hasMany(VehiclePolicy, {
  foreignKey: 'insurance_company_id',
  as: 'vehiclePolicies'
});
InsuranceCompany.hasMany(HealthPolicy, {
  foreignKey: 'insurance_company_id',
  as: 'healthPolicies'
});
InsuranceCompany.hasMany(FirePolicy, {
  foreignKey: 'insurance_company_id',
  as: 'firePolicies'
});
InsuranceCompany.hasMany(LifePolicy, {
  foreignKey: 'insurance_company_id',
  as: 'lifePolicies'
});
EmployeeCompensationPolicy.belongsTo(InsuranceCompany, {
  foreignKey: 'insurance_company_id',
  as: 'provider'
});
VehiclePolicy.belongsTo(InsuranceCompany, {
  foreignKey: 'insurance_company_id',
  as: 'provider'
});
HealthPolicy.belongsTo(InsuranceCompany, {
  foreignKey: 'insurance_company_id',
  as: 'provider'
});

// Company and Policy associations
Company.hasMany(EmployeeCompensationPolicy, {
  foreignKey: 'company_id',
  as: 'employeePolicies'
});
Company.hasMany(VehiclePolicy, {
  foreignKey: 'company_id',
  as: 'vehiclePoliciesByCompany'
});
Company.hasMany(HealthPolicy, {
  foreignKey: 'company_id',
  as: 'healthPoliciesByCompany'
});
Company.hasMany(FirePolicy, {
  foreignKey: 'company_id',
  as: 'firePoliciesByCompany'
});
Company.hasMany(LifePolicy, {
  foreignKey: 'company_id',
  as: 'lifePoliciesByCompany'
});
EmployeeCompensationPolicy.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'policyHolder'
});
VehiclePolicy.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'companyPolicyHolder'
});
HealthPolicy.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'companyPolicyHolder'
});

// Consumer and Policy associations
Consumer.hasMany(VehiclePolicy, {
  foreignKey: 'consumer_id',
  as: 'vehiclePoliciesByConsumer'
});
Consumer.hasMany(HealthPolicy, {
  foreignKey: 'consumer_id',
  as: 'healthPoliciesByConsumer'
});
Consumer.hasMany(FirePolicy, {
  foreignKey: 'consumer_id',
  as: 'firePoliciesByConsumer'
});
Consumer.hasMany(LifePolicy, {
  foreignKey: 'consumer_id',
  as: 'lifePoliciesByConsumer'
});
VehiclePolicy.belongsTo(Consumer, {
  foreignKey: 'consumer_id',
  as: 'consumerPolicyHolder'
});
HealthPolicy.belongsTo(Consumer, {
  foreignKey: 'consumer_id',
  as: 'consumerPolicyHolder'
});

// Add the belongsTo associations for FirePolicy
FirePolicy.belongsTo(InsuranceCompany, {
  foreignKey: 'insurance_company_id',
  as: 'provider'
});
FirePolicy.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'companyPolicyHolder'
});
FirePolicy.belongsTo(Consumer, {
  foreignKey: 'consumer_id',
  as: 'consumerPolicyHolder'
});

// Add the belongsTo associations for LifePolicy
LifePolicy.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'companyPolicyHolder'
});

LifePolicy.belongsTo(Consumer, {
  foreignKey: 'consumer_id',
  as: 'consumerPolicyHolder'
});

LifePolicy.belongsTo(InsuranceCompany, {
  foreignKey: 'insurance_company_id',
  as: 'provider'
});

// Add DSC associations
Company.hasMany(DSC, {
  foreignKey: 'company_id',
  as: 'dscs'
});
Consumer.hasMany(DSC, {
  foreignKey: 'consumer_id',
  as: 'dscs'
});
DSC.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});
DSC.belongsTo(Consumer, {
  foreignKey: 'consumer_id',
  as: 'consumer'
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
  EmployeeCompensationPolicy,
  VehiclePolicy,
  HealthPolicy,
  FirePolicy,
  LifePolicy,
  DSC
};