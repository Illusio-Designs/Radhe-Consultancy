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

// Define associations
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

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
  StabilityManagement
};
