const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    console.log('Starting admin password reset process...');
    
    // Get admin role
    const adminRole = await Role.findOne({ where: { role_name: 'admin' } });
    if (!adminRole) {
      console.error('Admin role not found in database');
      return false;
    }
    console.log('Admin role found:', adminRole.role_name);

    // Get admin email and password from environment variables or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@radheconsultancy.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    
    console.log('Using admin credentials:', {
      email: adminEmail,
      password: '********' // Don't log the actual password
    });

    // Find or create admin user
    let adminUser = await User.findOne({ 
      where: { email: adminEmail },
      include: [{ model: Role }]
    });

    if (!adminUser) {
      console.log('Admin user not found, creating new admin user...');
      adminUser = await User.create({
        username: 'admin',
        email: adminEmail,
        password: adminPassword, // Will be hashed by the model's beforeCreate hook
        role_id: adminRole.id
      });
      console.log('New admin user created successfully');
    } else {
      console.log('Existing admin user found, updating password...');
      adminUser.password = adminPassword; // Will be hashed by the model's beforeUpdate hook
      await adminUser.save();
      console.log('Admin password updated successfully');
    }

    // Verify the password was set correctly
    const isValidPassword = await adminUser.validatePassword(adminPassword);
    console.log('Password verification result:', isValidPassword);

    if (!isValidPassword) {
      console.error('Warning: Admin password verification failed after reset');
      return false;
    }

    console.log('Admin password reset completed successfully');
    return true;
  } catch (error) {
    console.error('Error during admin password reset:', error);
    return false;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  resetAdminPassword()
    .then(success => {
      if (success) {
        console.log('Admin password reset completed successfully');
        process.exit(0);
      } else {
        console.error('Admin password reset failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = resetAdminPassword; 