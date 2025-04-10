const { Role } = require('../models');
const sequelize = require('../config/db');

const defaultRoles = [
  { role_name: 'Admin' },
  { role_name: 'User' },
  { role_name: 'Vendor Manager' },
  { role_name: 'Insurance Manager' }
];

const seedRoles = async () => {
  try {
    console.log('Starting to seed roles...');
    
    const rolesToCreate = [
      { role_name: 'Admin', description: 'Super Admin with all permissions' },
      { role_name: 'User', description: 'Regular user with limited permissions' },
      { role_name: 'Vendor Manager', description: 'Can manage vendors' },
      { role_name: 'Insurance Manager', description: 'Can manage insurance' }
    ];

    for (const role of rolesToCreate) {
      const [createdRole, created] = await Role.findOrCreate({
        where: { role_name: role.role_name },
        defaults: role
      });

      if (created) {
        console.log(`Created role: ${role.role_name}`);
      } else {
        console.log(`Role already exists: ${role.role_name}`);
      }
    }

    console.log('Default roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
};

// Run the seed function
seedRoles(); 