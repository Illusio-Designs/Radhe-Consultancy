const sequelize = require('../config/db');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const RolePermission = require('../models/rolePermissionModel');

const roles = [
  {
    role_name: 'admin',
    description: 'Full system access'
  },
  {
    role_name: 'user_manager',
    description: 'User management access'
  },
  {
    role_name: 'user',
    description: 'Default user role'
  },
  {
    role_name: 'vendor_manager',
    description: 'Company and consumer management access'
  },
  {
    role_name: 'company',
    description: 'Company-specific access'
  },
  {
    role_name: 'consumer',
    description: 'Consumer-specific access'
  }
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

const rolePermissions = {
  admin: permissions.map(p => p.permission_name), // All permissions
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
    'access_dashboard', 'access_reports'
  ],
  company: [
    'access_dashboard',
    'view_companies', 'edit_company'
  ],
  consumer: [
    'access_dashboard',
    'view_consumers', 'edit_consumer'
  ]
};

async function setupRolesAndPermissions() {
  try {
    // Sync all models
    await sequelize.sync({ force: true });

    // Create roles
    for (const role of roles) {
      await Role.create(role);
    }
    console.log('Roles created successfully');

    // Create permissions
    for (const permission of permissions) {
      await Permission.create(permission);
    }
    console.log('Permissions created successfully');

    // Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ where: { role_name: roleName } });
      const permissions = await Permission.findAll({
        where: { permission_name: permissionNames }
      });

      for (const permission of permissions) {
        await RolePermission.create({
          role_id: role.id,
          permission_id: permission.id
        });
      }
    }
    console.log('Role permissions assigned successfully');

    console.log('Setup completed successfully');
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    await sequelize.close();
  }
}

setupRolesAndPermissions(); 