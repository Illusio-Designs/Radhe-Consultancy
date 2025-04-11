const { Permission } = require('../models');

const permissions = [
  { permission_name: 'create_user', description: 'Create a new user' },
  { permission_name: 'delete_user', description: 'Delete a user' },
  { permission_name: 'view_vendor', description: 'View vendor details' },
  { permission_name: 'edit_vendor', description: 'Edit vendor details' },
  // Add more permissions as needed
];

const seedPermissions = async () => {
  try {
    await Permission.bulkCreate(permissions);
    console.log('Permissions seeded successfully');
  } catch (error) {
    console.error('Error seeding permissions:', error);
  }
};

seedPermissions();
