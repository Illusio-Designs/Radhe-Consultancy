const sequelize = require("../config/db");

// Import models
const User = require("./userModel");
const Role = require("./roleModel");
const UserRole = require("./userRoleModel");
const Company = require("./companyModel");
const Consumer = require("./consumerModel");
const InsuranceCompany = require("./insuranceCompanyModel");
const EmployeeCompensationPolicy = require("./employeeCompensationPolicyModel");
const VehiclePolicy = require("./vehiclePolicyModel");
const HealthPolicy = require("./healthPolicyModel");
const FirePolicy = require("./firePolicyModel");
const LifePolicy = require("./lifePolicyModel");
const DSC = require("./dscModel");
const ReminderLog = require("./reminderLogModel");
const DSCLog = require("./dscLogModel");
const UserRoleWorkLog = require("./userRoleWorkLogModel");
const FactoryQuotation = require("./factoryQuotationModel");
const PlanManagement = require("./planManagementModel");
const StabilityManagement = require('./stabilityManagementModel');
const ApplicationManagement = require('./applicationManagementModel');

// Define associations
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

// Company-User Associations
Company.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Company, { foreignKey: 'user_id', as: 'company' });

// Plan Management Associations
PlanManagement.belongsTo(FactoryQuotation, { foreignKey: 'factory_quotation_id', as: 'factoryQuotation' });
PlanManagement.belongsTo(User, { foreignKey: 'plan_manager_id', as: 'planManager' });
PlanManagement.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
FactoryQuotation.hasOne(PlanManagement, { foreignKey: 'factory_quotation_id', as: 'planManagement' });

// Stability Management Associations
StabilityManagement.belongsTo(FactoryQuotation, { foreignKey: 'factory_quotation_id', as: 'factoryQuotation' });
StabilityManagement.belongsTo(User, { foreignKey: 'stability_manager_id', as: 'stabilityManager' });
StabilityManagement.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
FactoryQuotation.hasOne(StabilityManagement, { foreignKey: 'factory_quotation_id', as: 'stabilityManagement' });

// Application Management Associations
ApplicationManagement.belongsTo(FactoryQuotation, { foreignKey: 'factory_quotation_id', as: 'factoryQuotation' });
ApplicationManagement.belongsTo(User, { foreignKey: 'compliance_manager_id', as: 'complianceManager' });
ApplicationManagement.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
FactoryQuotation.hasOne(ApplicationManagement, { foreignKey: 'factory_quotation_id', as: 'applicationManagement' });

// Factory Quotation - Company Association
FactoryQuotation.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Company.hasMany(FactoryQuotation, { foreignKey: 'company_id', as: 'factoryQuotations' });

// Employee Compensation Policy Associations
EmployeeCompensationPolicy.belongsTo(Company, { foreignKey: 'company_id', as: 'policyHolder' });
Company.hasMany(EmployeeCompensationPolicy, { foreignKey: 'company_id', as: 'employeeCompensationPolicies' });

// Vehicle Policy Associations
VehiclePolicy.belongsTo(Company, { foreignKey: 'company_id', as: 'companyPolicyHolder' });
VehiclePolicy.belongsTo(Consumer, { foreignKey: 'consumer_id', as: 'consumerPolicyHolder' });
Company.hasMany(VehiclePolicy, { foreignKey: 'company_id', as: 'vehiclePolicies' });
Consumer.hasMany(VehiclePolicy, { foreignKey: 'consumer_id', as: 'vehiclePolicies' });

// Health Policy Associations
HealthPolicy.belongsTo(Company, { foreignKey: 'company_id', as: 'companyPolicyHolder' });
HealthPolicy.belongsTo(Consumer, { foreignKey: 'consumer_id', as: 'consumerPolicyHolder' });
Company.hasMany(HealthPolicy, { foreignKey: 'company_id', as: 'healthPolicies' });
Consumer.hasMany(HealthPolicy, { foreignKey: 'consumer_id', as: 'healthPolicies' });

// Fire Policy Associations
FirePolicy.belongsTo(Company, { foreignKey: 'company_id', as: 'companyPolicyHolder' });
FirePolicy.belongsTo(Consumer, { foreignKey: 'consumer_id', as: 'consumerPolicyHolder' });
Company.hasMany(FirePolicy, { foreignKey: 'company_id', as: 'firePolicies' });
Consumer.hasMany(FirePolicy, { foreignKey: 'consumer_id', as: 'firePolicies' });

// DSC Associations
DSC.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
DSC.belongsTo(Consumer, { foreignKey: 'consumer_id', as: 'consumer' });
Company.hasMany(DSC, { foreignKey: 'company_id', as: 'dscs' });
Consumer.hasMany(DSC, { foreignKey: 'consumer_id', as: 'dscs' });

module.exports = {
  User,
  Role,
  UserRole,
  Company,
  Consumer,
  InsuranceCompany,
  EmployeeCompensationPolicy,
  VehiclePolicy,
  HealthPolicy,
  FirePolicy,
  LifePolicy,
  DSC,
  ReminderLog,
  DSCLog,
  UserRoleWorkLog,
  FactoryQuotation,
  PlanManagement,
  StabilityManagement,
  ApplicationManagement
};
