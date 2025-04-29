const sequelize = require('../config/db');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const RolePermission = require('../models/rolePermissionModel');
const User = require('../models/userModel');
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
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created uploads directory for company documents');
    }

    // Sync all models with alter to update the schema
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');

    // Create default roles if they don't exist
    const defaultRoles = [
      { role_name: 'admin', description: 'Full system access' },
      { role_name: 'user_manager', description: 'User management access' },
      { role_name: 'user', description: 'Default user role' },
      { role_name: 'vendor_manager', description: 'Company and consumer management access' },
      { role_name: 'company', description: 'Company-specific access' },
      { role_name: 'consumer', description: 'Consumer-specific access' }
    ];

    for (const role of defaultRoles) {
      await Role.findOrCreate({
        where: { role_name: role.role_name },
        defaults: role
      });
    }
    console.log('Default roles verified');

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
      { permission_name: 'access_settings' }
    ];

    for (const permission of defaultPermissions) {
      await Permission.findOrCreate({
        where: { permission_name: permission.permission_name },
        defaults: permission
      });
    }
    console.log('Default permissions verified');

    // Assign permissions to roles
    const rolePermissions = {
      admin: defaultPermissions.map(p => p.permission_name), // All permissions
      user_manager: [
        'view_users', 'create_user', 'edit_user', 'delete_user',
        'view_roles', 'assign_roles', 'access_dashboard'
      ],
      user: [
        'access_dashboard'
      ],
      vendor_manager: [
        'view_companies', 'create_company', 'edit_company', 'delete_company',
        'view_consumers', 'create_consumer', 'edit_consumer', 'delete_consumer',
        'access_dashboard', 'access_reports', 'upload_company_documents'
      ],
      company: [
        'access_dashboard',
        'view_companies', 'edit_company',
        'upload_company_documents'
      ],
      consumer: [
        'access_dashboard',
        'view_consumers', 'edit_consumer'
      ]
    };

    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ where: { role_name: roleName } });
      if (role) {
        for (const permName of permissionNames) {
          const permission = await Permission.findOne({ where: { permission_name: permName } });
          if (permission) {
            await RolePermission.findOrCreate({
              where: {
                role_id: role.id,
                permission_id: permission.id
              }
            });
          }
        }
      }
    }
    console.log('Role permissions verified');

    // Create default admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'Admin@radheconsultancy.co.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    
    const adminRole = await Role.findOne({ where: { role_name: 'admin' } });
    if (adminRole) {
      await User.findOrCreate({
        where: { email: adminEmail },
        defaults: {
          username: 'admin',
          email: adminEmail,
          password: adminPassword,
          role_id: adminRole.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('Default admin user verified');
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