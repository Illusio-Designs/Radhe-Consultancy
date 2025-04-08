const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../config/db');
const { Role, Permission, RolePermission, Vendor, CompanyVendor, ConsumerVendor, User } = require('../models');

async function resetAndSeed() {
  try {
    console.log('Starting database reset and seed...');
    
    // Test connection first
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Foreign key checks disabled');
    
    // Drop all tables in correct order (child tables first)
    console.log('Dropping tables...');
    await ConsumerVendor.drop();
    await CompanyVendor.drop();
    await Vendor.drop();
    await RolePermission.drop();
    await Permission.drop();
    await Role.drop();
    await User.drop();
    console.log('All tables dropped successfully');
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Foreign key checks enabled');
    
    // Sync models
    await sequelize.sync({ force: true });
    console.log('Models synced successfully');
    
    // Create default permissions
    console.log('Creating default permissions...');
    const permissions = await Permission.bulkCreate([
      { permission_name: 'create_vendor', description: 'Can create vendors' },
      { permission_name: 'view_vendor', description: 'Can view vendors' },
      { permission_name: 'edit_vendor', description: 'Can edit vendors' },
      { permission_name: 'delete_vendor', description: 'Can delete vendors' }
    ]);
    console.log('Default permissions created');
    
    // Create default roles
    console.log('Creating default roles...');
    const roles = await Role.bulkCreate([
      { role_name: 'Admin', description: 'Super Admin with all permissions' },
      { role_name: 'Vendor Manager', description: 'Can manage vendors' }
    ]);
    console.log('Default roles created');
    
    // Assign all permissions to Admin role
    console.log('Assigning permissions to Admin role...');
    await roles[0].addPermissions(permissions);
    
    // Assign vendor-related permissions to Vendor Manager role
    console.log('Assigning permissions to Vendor Manager role...');
    await roles[1].addPermissions(permissions);
    
    console.log('Database reset and seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting and seeding database:', error);
    process.exit(1);
  }
}

resetAndSeed();
