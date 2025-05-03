const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

async function resetAdminPassword() {
  try {
    console.log('Starting admin password reset...');
    
    // Admin credentials
    const adminEmail = 'Admin@radheconsultancy.co.in';
    const adminPassword = 'Admin@123';
    
    // Find admin role
    const adminRole = await Role.findOne({ where: { role_name: 'admin' } });
    if (!adminRole) {
      console.error('Admin role not found');
      process.exit(1);
    }
    
    // Find or create admin user
    let adminUser = await User.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      console.log('Creating new admin user...');
      adminUser = await User.create({
        username: 'Admin',
        email: adminEmail,
        role_id: adminRole.id
      });
    }
    
    // Hash the new password
    console.log('Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Update admin user's password using raw query
    console.log('Updating admin password...');
    await sequelize.query(
      'UPDATE Users SET password = ? WHERE email = ?',
      {
        replacements: [hashedPassword, adminEmail],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    // Verify the password was set correctly
    const updatedUser = await User.findOne({ where: { email: adminEmail } });
    const isValid = await bcrypt.compare(adminPassword, updatedUser.password);
    if (!isValid) {
      throw new Error('Password verification failed');
    }
    
    console.log('Admin password reset successful!');
    console.log('New credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Password hash:', hashedPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword(); 