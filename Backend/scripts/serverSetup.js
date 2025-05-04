// Combined Database Initialization, Seeding, and Admin Setup Script
// This script syncs tables, seeds roles/permissions, assigns permissions, sets admin password, and checks admin user.

const { sequelize, User, Role, Permission, RolePermission, Company, Consumer, InsuranceCompany, EmployeeCompensationPolicy } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

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

async function setupAll() {
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
      // First, remove any existing unique constraints
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
      // Drop possible duplicate indexes/foreign keys (adjust names if needed)
      await sequelize.query(`
        ALTER TABLE employee_compensation_policies
        DROP INDEX IF EXISTS policy_number,
        DROP INDEX IF EXISTS insurance_company_id,
        DROP INDEX IF EXISTS company_id,
        DROP FOREIGN KEY IF EXISTS employee_compensation_policies_ibfk_1,
        DROP FOREIGN KEY IF EXISTS employee_compensation_policies_ibfk_2,
        DROP FOREIGN KEY IF EXISTS fk_insurance_company,
        DROP FOREIGN KEY IF EXISTS fk_company
      `).catch(() => {}); // Ignore errors if constraints don't exist
      // Sync the model (will only alter, not drop data)
      await EmployeeCompensationPolicy.sync({ 
        alter: true,
        logging: false
      });
      // Add foreign key constraints after table is created (if not already present)
      await sequelize.query(`
        ALTER TABLE employee_compensation_policies
        ADD CONSTRAINT IF NOT EXISTS fk_insurance_company
        FOREIGN KEY (insurance_company_id)
        REFERENCES InsuranceCompanies(id)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,
        ADD CONSTRAINT IF NOT EXISTS fk_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
        ON DELETE NO ACTION
        ON UPDATE CASCADE
      `).catch(() => {}); // Ignore if already exists
    } catch (error) {
      console.error('Error syncing EmployeeCompensationPolicy:', error.message);
      throw error;
    }
    
    console.log('All tables synced');

    // Seed roles
    for (const role of roles) {
      await Role.findOrCreate({ where: { role_name: role.role_name }, defaults: role });
    }
    console.log('Default roles created');

    // Seed permissions
    for (const permission of permissions) {
      await Permission.findOrCreate({ where: { permission_name: permission.permission_name }, defaults: permission });
    }
    console.log('Default permissions created');

    // Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ where: { role_name: roleName } });
      const perms = await Permission.findAll({ where: { permission_name: permissionNames } });
      for (const perm of perms) {
        await RolePermission.findOrCreate({ where: { role_id: role.id, permission_id: perm.id } });
      }
    }
    console.log('Role-permission assignments created');

    // Create or update default admin user
    await setupAdminUser();

    // Verify admin user
    const adminUser = await User.findOne({ 
      where: { email: 'Admin@radheconsultancy.co.in' }, 
      include: [{ model: Role, attributes: ['role_name'] }] 
    });
    
    if (adminUser) {
      const isValid = await adminUser.validatePassword('Admin@123');
      console.log('Admin user verified:', isValid ? 'Password valid' : 'Password invalid');
    }

    console.log('Database setup completed successfully');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during database setup:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

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
  } catch (error) {
    console.error('Error setting up admin user:', error.message);
    throw error;
  }
}

if (require.main === module) {
  setupAll();
} 