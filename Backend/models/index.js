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
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', as: 'users' });

// Company-User Associations
Company.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Company, { foreignKey: 'user_id', as: 'company' });

// Consumer-User Associations
Consumer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Consumer, { foreignKey: 'user_id', as: 'consumer' });

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
EmployeeCompensationPolicy.belongsTo(InsuranceCompany, { foreignKey: 'insurance_company_id', as: 'provider' });
Company.hasMany(EmployeeCompensationPolicy, { foreignKey: 'company_id', as: 'employeeCompensationPolicies' });
InsuranceCompany.hasMany(EmployeeCompensationPolicy, { foreignKey: 'insurance_company_id', as: 'employeeCompensationPolicies' });

// Vehicle Policy Associations
VehiclePolicy.belongsTo(Company, { foreignKey: 'company_id', as: 'companyPolicyHolder' });
VehiclePolicy.belongsTo(Consumer, { foreignKey: 'consumer_id', as: 'consumerPolicyHolder' });
VehiclePolicy.belongsTo(InsuranceCompany, { foreignKey: 'insurance_company_id', as: 'provider' });
Company.hasMany(VehiclePolicy, { foreignKey: 'company_id', as: 'vehiclePolicies' });
Consumer.hasMany(VehiclePolicy, { foreignKey: 'consumer_id', as: 'vehiclePolicies' });
InsuranceCompany.hasMany(VehiclePolicy, { foreignKey: 'insurance_company_id', as: 'vehiclePolicies' });

// Health Policy Associations
HealthPolicy.belongsTo(Company, { foreignKey: 'company_id', as: 'companyPolicyHolder' });
HealthPolicy.belongsTo(Consumer, { foreignKey: 'consumer_id', as: 'consumerPolicyHolder' });
HealthPolicy.belongsTo(InsuranceCompany, { foreignKey: 'insurance_company_id', as: 'provider' });
Company.hasMany(HealthPolicy, { foreignKey: 'company_id', as: 'healthPolicies' });
Consumer.hasMany(HealthPolicy, { foreignKey: 'consumer_id', as: 'healthPolicies' });
InsuranceCompany.hasMany(HealthPolicy, { foreignKey: 'insurance_company_id', as: 'healthPolicies' });

// Fire Policy Associations
FirePolicy.belongsTo(Company, { foreignKey: 'company_id', as: 'companyPolicyHolder' });
FirePolicy.belongsTo(Consumer, { foreignKey: 'consumer_id', as: 'consumerPolicyHolder' });
FirePolicy.belongsTo(InsuranceCompany, { foreignKey: 'insurance_company_id', as: 'provider' });
Company.hasMany(FirePolicy, { foreignKey: 'company_id', as: 'firePolicies' });
Consumer.hasMany(FirePolicy, { foreignKey: 'consumer_id', as: 'firePolicies' });
InsuranceCompany.hasMany(FirePolicy, { foreignKey: 'insurance_company_id', as: 'firePolicies' });

// Life Policy Associations
LifePolicy.belongsTo(Company, { foreignKey: 'company_id', as: 'companyPolicyHolder' });
LifePolicy.belongsTo(Consumer, { foreignKey: 'consumer_id', as: 'consumerPolicyHolder' });
LifePolicy.belongsTo(InsuranceCompany, { foreignKey: 'insurance_company_id', as: 'provider' });
Company.hasMany(LifePolicy, { foreignKey: 'company_id', as: 'lifePolicies' });
Consumer.hasMany(LifePolicy, { foreignKey: 'consumer_id', as: 'lifePolicies' });
InsuranceCompany.hasMany(LifePolicy, { foreignKey: 'insurance_company_id', as: 'lifePolicies' });

// DSC Associations
DSC.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
DSC.belongsTo(Consumer, { foreignKey: 'consumer_id', as: 'consumer' });
Company.hasMany(DSC, { foreignKey: 'company_id', as: 'dscs' });
Consumer.hasMany(DSC, { foreignKey: 'consumer_id', as: 'dscs' });

// DSC Log Associations
DSCLog.belongsTo(User, { foreignKey: 'performed_by', as: 'user' });
DSCLog.belongsTo(DSC, { foreignKey: 'dsc_id', as: 'dsc' });
User.hasMany(DSCLog, { foreignKey: 'performed_by', as: 'dscLogs' });
DSC.hasMany(DSCLog, { foreignKey: 'dsc_id', as: 'dscLogs' });

// User Role Work Log Associations
UserRoleWorkLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserRoleWorkLog.belongsTo(User, { foreignKey: 'target_user_id', as: 'targetUser' });
UserRoleWorkLog.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
User.hasMany(UserRoleWorkLog, { foreignKey: 'user_id', as: 'userRoleWorkLogs' });
User.hasMany(UserRoleWorkLog, { foreignKey: 'target_user_id', as: 'targetUserRoleWorkLogs' });
Role.hasMany(UserRoleWorkLog, { foreignKey: 'role_id', as: 'userRoleWorkLogs' });

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
  ApplicationManagement,
  sequelize
};
