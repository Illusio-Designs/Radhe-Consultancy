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

    // Remove unique constraint from company_email
    try {
      // First try to find any constraints on company_email
      const result = await sequelize.query(`
        SELECT DISTINCT tc.CONSTRAINT_NAME, tc.CONSTRAINT_TYPE
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
          AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
          AND tc.TABLE_NAME = kcu.TABLE_NAME
        WHERE tc.TABLE_SCHEMA = ? 
        AND tc.TABLE_NAME = 'companies' 
        AND kcu.COLUMN_NAME = 'company_email'
      `, { 
        replacements: [sequelize.config.database],
        type: sequelize.QueryTypes.SELECT 
      });

      if (result && result.length > 0) {
        console.log('Found constraints on company_email:', result);
        for (const row of result) {
          if (row.CONSTRAINT_TYPE === 'UNIQUE') {
            await sequelize.query(`ALTER TABLE companies DROP INDEX ${row.CONSTRAINT_NAME}`);
            console.log(`Dropped unique constraint ${row.CONSTRAINT_NAME} from company_email`);
          }
        }
      } else {
        console.log('No constraints found on company_email');
      }

      // Also try to find any indexes on company_email
      const indexResult = await sequelize.query(`
        SELECT INDEX_NAME
        FROM information_schema.statistics
        WHERE table_schema = ?
        AND table_name = 'companies'
        AND column_name = 'company_email'
      `, {
        replacements: [sequelize.config.database],
        type: sequelize.QueryTypes.SELECT
      });

      if (indexResult && indexResult.length > 0) {
        console.log('Found indexes on company_email:', indexResult);
        for (const row of indexResult) {
          await sequelize.query(`ALTER TABLE companies DROP INDEX ${row.INDEX_NAME}`);
          console.log(`Dropped index ${row.INDEX_NAME} from company_email`);
        }
      }
    } catch (error) {
      console.log('Error removing company_email constraints:', error.message);
    }

    // Ensure GST number has unique constraint
    try {
      const result = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.table_constraints 
        WHERE table_schema = ? 
        AND table_name = 'companies' 
        AND constraint_name = 'companies_gst_number_key'
      `, { 
        replacements: [sequelize.config.database],
        type: sequelize.QueryTypes.SELECT 
      });

      if (result && result[0] && result[0].count === 0) {
        await sequelize.query('ALTER TABLE companies ADD UNIQUE INDEX companies_gst_number_key (gst_number)');
        console.log('Added unique constraint to gst_number');
      } else {
        console.log('GST number constraint already exists');
      }
    } catch (error) {
      console.log('Error ensuring GST number constraint:', error.message);
    }

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
    const adminContact = process.env.ADMIN_CONTACT || '1234567890';
    
    const adminRole = await Role.findOne({ where: { role_name: 'admin' } });
    if (adminRole) {
      await User.findOrCreate({
        where: { email: adminEmail },
        defaults: {
          username: 'admin',
          email: adminEmail,
          password: adminPassword,
          contact_number: adminContact,
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