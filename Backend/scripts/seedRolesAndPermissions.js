const { Role, RolePermission } = require('../models');

async function seedRolesAndPermissions() {
  try {
    // Create default roles
    const [adminRole, userRole] = await Promise.all([
      Role.findOrCreate({
        where: { role_name: 'Admin' }
      }),
      Role.findOrCreate({
        where: { role_name: 'User' }
      })
    ]);

    // Create permissions for Admin role
    await RolePermission.findOrCreate({
      where: {
        role_id: adminRole[0].role_id,
        permission_type: 'view'
      }
    });

    await RolePermission.findOrCreate({
      where: {
        role_id: adminRole[0].role_id,
        permission_type: 'edit'
      }
    });

    await RolePermission.findOrCreate({
      where: {
        role_id: adminRole[0].role_id,
        permission_type: 'delete'
      }
    });

    // Create permissions for User role
    await RolePermission.findOrCreate({
      where: {
        role_id: userRole[0].role_id,
        permission_type: 'view'
      }
    });

    console.log('Roles and permissions seeded successfully');
  } catch (error) {
    console.error('Error seeding roles and permissions:', error);
  }
}

seedRolesAndPermissions(); 