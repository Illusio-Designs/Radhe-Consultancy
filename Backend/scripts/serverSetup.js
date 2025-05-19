// Combined Database Initialization, Seeding, and Admin Setup Script
// This script handles database setup, roles/permissions setup, and admin user setup

const { sequelize, User, Role, Permission, RolePermission, Company, Consumer, InsuranceCompany, EmployeeCompensationPolicy } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Role definitions
const roles = [
  { role_name: 'Admin', description: 'Full system access' },
  { role_name: 'User', description: 'Basic user access' },
  { role_name: 'Vendor_manager', description: 'Vendor management access' },
  { role_name: 'User_manager', description: 'User management access' },
  { role_name: 'Company', description: 'Company access' },
  { role_name: 'Consumer', description: 'Consumer access' },
  { role_name: 'Insurance_manager', description: 'Insurance management access' },
  { role_name: 'Compliance_manager', description: 'Compliance management access' },
  { role_name: 'DSC_manager', description: 'Digital Signature Certificate management access' }
];

// Permission definitions
const permissions = [
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

// Role-Permission mappings
const rolePermissions = {
  'Admin': permissions.map(p => p.permission_name), // All permissions
  'User': [ 'access_dashboard' ],
  'Vendor_manager': [
    'view_companies', 'create_company', 'edit_company', 'delete_company',
    'view_consumers', 'create_consumer', 'edit_consumer', 'delete_consumer',
    'access_dashboard', 'access_reports', 'upload_company_documents'
  ],
  'User_manager': [
    'view_users', 'create_user', 'edit_user', 'delete_user',
    'view_roles', 'assign_roles', 'access_dashboard'
  ],
  'Company': [
    'access_dashboard',
    'view_companies', 'edit_company',
    'upload_company_documents'
  ],
  'Consumer': [
    'access_dashboard',
    'view_consumers', 'edit_consumer'
  ],
  'Insurance_manager': [
    'access_dashboard',
    'view_insurance_companies',
    'create_insurance_company',
    'edit_insurance_company',
    'delete_insurance_company',
    'view_policies',
    'create_policy',
    'edit_policy',
    'delete_policy',
    'access_reports'
  ],
  'Compliance_manager': [
    'access_dashboard',
    'view_companies',
    'view_consumers',
    'view_insurance_companies',
    'view_policies',
    'access_reports'
  ],
  'DSC_manager': [
    'access_dashboard',
    'view_users',
    'edit_user',
    'access_reports'
  ]
};

/**
 * Sets up the database structure and required directories
 * @returns {Promise<boolean>} Success status
 */
async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    await sequelize.authenticate();
    console.log('Database connection established');

    // Create uploads directories if needed
    const uploadDir = path.join(__dirname, '../uploads/company_documents');
    const policyDir = path.join(__dirname, '../uploads/policies');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!fs.existsSync(policyDir)) fs.mkdirSync(policyDir, { recursive: true });

    // Sync all models with individual options
    await Role.sync({ alter: true });
    await Permission.sync({ alter: true });
    await RolePermission.sync({ alter: true });
    await User.sync({ alter: true });
    await Company.sync({ alter: true });
    await Consumer.sync({ alter: true });
    
    // Special handling for InsuranceCompany
    try {
      await sequelize.query(`
        ALTER TABLE InsuranceCompanies 
        DROP INDEX name
      `).catch(() => {}); // Ignore error if index doesn't exist
      
      await InsuranceCompany.sync({ 
        alter: true,
        logging: false
      });
    } catch (error) {
      console.error('Error syncing InsuranceCompany:', error.message);
      throw error;
    }

    // Special handling for EmployeeCompensationPolicy
    try {
      await sequelize.query(`
        ALTER TABLE EmployeeCompensationPolicies
        DROP INDEX IF EXISTS policy_number,
        DROP INDEX IF EXISTS insurance_company_id,
        DROP INDEX IF EXISTS company_id,
        DROP FOREIGN KEY IF EXISTS employee_compensation_policies_ibfk_1,
        DROP FOREIGN KEY IF EXISTS employee_compensation_policies_ibfk_2,
        DROP FOREIGN KEY IF EXISTS fk_insurance_company,
        DROP FOREIGN KEY IF EXISTS fk_company
      `).catch(() => {}); // Ignore errors if constraints don't exist
      
      await EmployeeCompensationPolicy.sync({ 
        alter: true,
        logging: false
      });
      
      await sequelize.query(`
        ALTER TABLE EmployeeCompensationPolicies
        ADD CONSTRAINT IF NOT EXISTS fk_insurance_company
        FOREIGN KEY (insurance_company_id)
        REFERENCES InsuranceCompanies(id)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,
        ADD CONSTRAINT IF NOT EXISTS fk_company
        FOREIGN KEY (company_id)
        REFERENCES Companies(company_id)
        ON DELETE NO ACTION
        ON UPDATE CASCADE
      `).catch(() => {}); // Ignore if already exists
    } catch (error) {
      console.error('Error syncing EmployeeCompensationPolicy:', error.message);
      throw error;
    }
    
    console.log('All tables synced');
    return true;
  } catch (error) {
    console.error('Error during database setup:', error.message);
    return false;
  }
}

/**
 * Sets up roles and permissions in the database
 * @returns {Promise<boolean>} Success status
 */
async function setupRolesAndPermissions() {
  try {
    console.log('Setting up roles and permissions...');
    
    // Update existing roles to capitalized format
    const existingRoles = await Role.findAll();
    for (const role of existingRoles) {
      const capitalizedRole = role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1);
      if (capitalizedRole !== role.role_name) {
        await role.update({ role_name: capitalizedRole });
        console.log(`Updated role name from ${role.role_name} to ${capitalizedRole}`);
      }
    }
    
    // Create roles
    for (const role of roles) {
      await Role.findOrCreate({ where: { role_name: role.role_name }, defaults: role });
    }
    console.log('Roles setup completed');

    // Create permissions
    for (const permission of permissions) {
      await Permission.findOrCreate({ 
        where: { permission_name: permission.permission_name }, 
        defaults: permission 
      });
    }
    console.log('Permissions setup completed');

    // Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ where: { role_name: roleName } });
      const perms = await Permission.findAll({ where: { permission_name: permissionNames } });
      
      for (const perm of perms) {
        await RolePermission.findOrCreate({ 
          where: { role_id: role.id, permission_id: perm.id } 
        });
      }
    }
    console.log('Role-permission assignments completed');
    return true;
  } catch (error) {
    console.error('Error setting up roles and permissions:', error.message);
    return false;
  }
}

/**
 * Sets up the admin user in the database
 * @returns {Promise<boolean>} Success status
 */
async function setupAdminUser() {
  try {
    console.log('Setting up admin user...');
    const adminRole = await Role.findOne({ where: { role_name: 'Admin' } });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    const [adminUser, created] = await User.findOrCreate({
      where: { email: 'Admin@radheconsultancy.co.in' },
      defaults: {
        username: 'Admin',
        password: 'Admin@123',
        role_id: adminRole.id,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    if (!created) {
      // Update existing admin user
      await adminUser.update({
        password: 'Admin@123',
        role_id: adminRole.id,
        updated_at: new Date()
      });
    }

    console.log('Admin user setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up admin user:', error.message);
    return false;
  }
}

/**
 * Runs all setup functions in sequence
 * @returns {Promise<void>}
 */
async function setupAll() {
  try {
    // First setup database structure
    const dbSetup = await setupDatabase();
    if (!dbSetup) {
      throw new Error('Database setup failed');
    }

    // Then setup roles and permissions
    const rolesSetup = await setupRolesAndPermissions();
    if (!rolesSetup) {
      throw new Error('Roles and permissions setup failed');
    }

    // Finally setup admin user
    const adminSetup = await setupAdminUser();
    if (!adminSetup) {
      throw new Error('Admin user setup failed');
    }

    console.log('All setup completed successfully');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during setup:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

// Export individual functions for use in other files
module.exports = {
  setupDatabase,
  setupRolesAndPermissions,
  setupAdminUser,
  setupAll
};

// Run setup if this file is run directly
if (require.main === module) {
  setupAll();
} 