// Account Verification Script
// This script checks what accounts exist in the database

const { User, Role, UserRole } = require('../models');
const sequelize = require('../config/db');

// Check existing accounts
async function checkExistingAccounts() {
  try {
    console.log('🔍 Checking existing accounts in database...\n');
    
    // Ensure database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');
    
    // Get all users
    const users = await User.findAll({
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'role_name'],
        through: { attributes: ['is_primary'] }
      }],
      order: [['created_at', 'ASC']]
    });
    
    console.log(`📊 Found ${users.length} users in database:\n`);
    console.log('='.repeat(80));
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Updated: ${user.updated_at}`);
        
        if (user.roles && user.roles.length > 0) {
          console.log(`   Roles: ${user.roles.map(role => 
            `${role.role_name}${role.UserRole.is_primary ? ' (Primary)' : ''}`
          ).join(', ')}`);
        } else {
          console.log(`   Roles: None assigned`);
        }
        console.log('');
      });
    }
    
    // Check specific required accounts
    console.log('🎯 Checking for required accounts:\n');
    console.log('='.repeat(80));
    
    const requiredAccounts = [
      { name: 'Admin', email: 'Admin@radheconsultancy.co.in', role: 'Admin' },
      // REMOVED: Test accounts no longer checked
    ];
    
    for (const account of requiredAccounts) {
      const user = await User.findOne({ 
        where: { email: account.email },
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['role_name']
        }]
      });
      
      if (user) {
        const hasRole = user.roles.some(role => role.role_name === account.role);
        if (hasRole) {
          console.log(`✅ ${account.name} (${account.email}) - ${account.role} role assigned`);
        } else {
          console.log(`⚠️  ${account.name} (${account.email}) - EXISTS but NO ${account.role} role`);
        }
      } else {
        console.log(`❌ ${account.name} (${account.email}) - MISSING`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 Account verification completed!');
    
    return true;
  } catch (error) {
    console.error('❌ Error checking accounts:', error.message);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Export function
module.exports = { checkExistingAccounts };

// Run if this file is run directly
if (require.main === module) {
  checkExistingAccounts()
    .then((success) => {
      if (success) {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
      } else {
        console.log('\n❌ Script failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Script crashed:', error);
      process.exit(1);
    });
}
