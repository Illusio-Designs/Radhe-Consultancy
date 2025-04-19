const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  try {
    console.log('Starting admin check...');
    
    // Check for admin role
    console.log('Checking for admin role...');
    const adminRole = await Role.findOne({
      where: { role_name: 'admin' }
    });
    console.log('Admin role found:', adminRole ? adminRole.toJSON() : 'Not found');

    // Check for admin user
    console.log('\nChecking for admin user...');
    const adminUser = await User.findOne({
      where: { email: 'Admin@radheconsultancy.co.in' }, // Ensure this uses the default email
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });
    console.log('Admin user found:', adminUser ? {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.Role ? adminUser.Role.role_name : 'No role assigned'
    } : 'Not found');

    if (adminUser) {
      // Validate password
      console.log('\nValidating admin password...');
      const isValidPassword = await bcrypt.compare('Admin@123', adminUser.password);
      console.log('Password validation:', isValidPassword ? 'Success' : 'Failed');
    }

    console.log('\nCheck completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during admin check:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

checkAdmin(); 