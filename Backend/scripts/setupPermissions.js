const { Role, Permission, RolePermission } = require('../models');
const sequelize = require('../config/db');

async function setupPermissions() {
  try {
    // Start a transaction
    await sequelize.transaction(async (t) => {
      console.log('Setting up permissions...');

      // Create or find vendor-related permissions
      const vendorPermissions = [
        'view_vendor',
        'create_vendor',
        'edit_vendor',
        'delete_vendor'
      ];

      console.log('Creating vendor permissions:', vendorPermissions);

      const permissions = await Promise.all(
        vendorPermissions.map(async (permissionName) => {
          const [permission] = await Permission.findOrCreate({
            where: { permission_name: permissionName },
            defaults: { permission_name: permissionName },
            transaction: t
          });
          console.log(`Permission ${permissionName} created/found with ID:`, permission.id);
          return permission;
        })
      );

      console.log('All permissions:', permissions.map(p => ({ id: p.id, name: p.permission_name })));

      // Find or create Admin role
      const [adminRole] = await Role.findOrCreate({
        where: { role_name: 'Admin' },
        defaults: { role_name: 'Admin' },
        transaction: t
      });

      console.log('Admin role:', { id: adminRole.id, name: adminRole.role_name });

      // Find or create User role
      const [userRole] = await Role.findOrCreate({
        where: { role_name: 'User' },
        defaults: { role_name: 'User' },
        transaction: t
      });

      console.log('User role:', { id: userRole.id, name: userRole.role_name });

      // Assign all permissions to Admin role
      console.log('Assigning permissions to Admin role...');
      for (const permission of permissions) {
        try {
          const [rolePermission] = await RolePermission.findOrCreate({
            where: {
              role_id: adminRole.id,
              permission_id: permission.id
            },
            defaults: {
              role_id: adminRole.id,
              permission_id: permission.id
            },
            transaction: t
          });
          console.log(`Assigned permission ${permission.permission_name} to Admin role`);
        } catch (error) {
          if (error.name !== 'SequelizeUniqueConstraintError') {
            throw error;
          }
          console.log(`Permission ${permission.permission_name} already assigned to Admin role`);
        }
      }

      // Assign view_vendor permission to User role
      const viewVendorPermission = permissions.find(p => p.permission_name === 'view_vendor');
      if (viewVendorPermission) {
        try {
          await RolePermission.findOrCreate({
            where: {
              role_id: userRole.id,
              permission_id: viewVendorPermission.id
            },
            defaults: {
              role_id: userRole.id,
              permission_id: viewVendorPermission.id
            },
            transaction: t
          });
          console.log('Assigned view_vendor permission to User role');
        } catch (error) {
          if (error.name !== 'SequelizeUniqueConstraintError') {
            throw error;
          }
          console.log('View vendor permission already assigned to User role');
        }
      }

      // Verify the permissions were assigned correctly
      const adminRoleWithPermissions = await Role.findByPk(adminRole.id, {
        include: [{
          model: Permission,
          through: { attributes: [] }
        }]
      });

      console.log('Admin role final permissions:', 
        adminRoleWithPermissions.Permissions.map(p => p.permission_name)
      );

      console.log('Permissions setup completed successfully!');
    });

  } catch (error) {
    console.error('Error setting up permissions:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

module.exports = setupPermissions;

// Run the setup
setupPermissions()
  .then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  }); 