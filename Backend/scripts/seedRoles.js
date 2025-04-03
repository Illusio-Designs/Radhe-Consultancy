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
    
    // Force sync to ensure tables are created
    await sequelize.sync({ force: true });
    console.log('Database synced');
    
    // Create roles one by one
    for (const role of defaultRoles) {
      try {
        const [createdRole, created] = await Role.findOrCreate({
          where: { role_name: role.role_name },
          defaults: role
        });
        
        if (created) {
          console.log(`Created role: ${role.role_name}`);
        } else {
          console.log(`Role already exists: ${role.role_name}`);
        }
      } catch (error) {
        console.error(`Error creating role ${role.role_name}:`, error);
        throw error;
      }
    }

    // Verify roles were created
    const roles = await Role.findAll();
    console.log('Current roles in database:', roles.map(r => r.role_name));
    
    console.log('Default roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

// Run the seed function
seedRoles(); 