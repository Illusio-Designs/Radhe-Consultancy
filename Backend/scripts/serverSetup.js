const sequelize = require('../config/db');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const RolePermission = require('../models/rolePermissionModel');
const User = require('../models/userModel');
const Company = require('../models/companyModel');
const InsuranceCompany = require('../models/insuranceCompanyModel');
const EmployeeCompensationPolicy = require('../models/employeeCompensationPolicyModel');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/company_documents');
    const policyDir = path.join(__dirname, '../uploads/policies');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created uploads directory for company documents');
    }
    if (!fs.existsSync(policyDir)) {
      fs.mkdirSync(policyDir, { recursive: true });
      console.log('Created uploads directory for policy documents');
    }

    // Sync models in the correct order based on dependencies using alter
    await Role.sync({ alter: true });
    console.log('Roles table altered');

    await Permission.sync({ alter: true });
    console.log('Permissions table altered');

    await RolePermission.sync({ alter: true });
    console.log('RolePermissions table altered');

    await User.sync({ alter: true });
    console.log('Users table altered');

    await Company.sync({ alter: true });
    console.log('Companies table altered');
    
    await InsuranceCompany.sync({ alter: true });
    console.log('InsuranceCompanies table altered');
    
    await EmployeeCompensationPolicy.sync({ alter: true });
    console.log('EmployeeCompensationPolicies table altered');

    // Create default roles if they don't exist
    const defaultRoles = [
      { role_name: 'admin', description: 'Full system access' },
      { role_name: 'user', description: 'Basic user access' },
      { role_name: 'vendor_manager', description: 'Vendor management access' },
      { role_name: 'user_manager', description: 'User management access' },
      { role_name: 'company', description: 'Company access' },
      { role_name: 'consumer', description: 'Consumer access' },
      { role_name: 'insurance_manager', description: 'Insurance management access' }
    ];

    for (const role of defaultRoles) {
      await Role.findOrCreate({
        where: { role_name: role.role_name },
        defaults: role
      });
    }
    console.log('Default roles checked/created');

    // Create default permissions if they don't exist
    const defaultPermissions = [
      // User Management
      { permission_name: 'view_users' },
      { permission_name: 'create_user' },
      { permission_name: 'edit_user' },
      { permission_name: 'delete_user' },
      
      // Company Management
      { permission_name: 'view_companies' },
      { permission_name: 'create_company' },
      { permission_name: 'edit_company' },
      { permission_name: 'delete_company' },
      { permission_name: 'upload_company_documents' },
      
      // Consumer Management
      { permission_name: 'view_consumers' },
      { permission_name: 'create_consumer' },
      { permission_name: 'edit_consumer' },
      { permission_name: 'delete_consumer' },
      
      // Role Management
      { permission_name: 'view_roles' },
      { permission_name: 'assign_roles' },
      
      // System Access
      { permission_name: 'access_dashboard' },
      { permission_name: 'access_reports' },
      { permission_name: 'access_settings' },

      // Insurance Management
      { permission_name: 'view_insurance_companies' },
      { permission_name: 'create_insurance_company' },
      { permission_name: 'edit_insurance_company' },
      { permission_name: 'delete_insurance_company' },
      { permission_name: 'view_policies' },
      { permission_name: 'create_policy' },
      { permission_name: 'edit_policy' },
      { permission_name: 'delete_policy' }
    ];

    for (const permission of defaultPermissions) {
      await Permission.findOrCreate({
        where: { permission_name: permission.permission_name },
        defaults: permission
      });
    }
    console.log('Default permissions checked/created');

    // Create default admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminRole = await Role.findOne({ where: { role_name: 'admin' } });
    if (adminRole) {
      await User.findOrCreate({
        where: { email: adminEmail },
        defaults: {
          username: 'admin',
          email: adminEmail,
          password: hashedPassword,
          role_id: adminRole.id
        }
      });
      console.log('Default admin user checked/created');
    }

    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Error during database initialization:', error);
    return false;
  }
}

module.exports = {
  initializeDatabase
}; 