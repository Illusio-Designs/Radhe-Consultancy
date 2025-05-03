const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  try {
    console.log('Checking admin user...');
    const user = await User.findOne({ 
      where: { email: 'Admin@radheconsultancy.co.in' },
      include: [{ model: require('../models/roleModel'), attributes: ['role_name'] }]
    });

    if (!user) {
      console.log('Admin user not found');
      return;
    }

    console.log('Admin user found:', {
      email: user.email,
      password: user.password,
      role: user.Role.role_name
    });

    // Try to validate the password
    const isValid = await user.validatePassword('Admin@123');
    console.log('Password validation result:', isValid);
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

checkAdmin(); 