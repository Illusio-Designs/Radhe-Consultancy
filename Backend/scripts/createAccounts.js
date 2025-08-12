// Account Creation and Verification Script
// This script checks existing accounts and creates missing ones

const { User, Role, UserRole } = require('../models');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file path
const accountLogPath = path.join(logsDir, 'account-creation.log');

// Logging function
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFile(accountLogPath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

// Account definitions
const requiredAccounts = {
  admin: {
    username: 'BRIJESH KANERIA',
    email: 'Admin@radheconsultancy.co.in',
    password: 'Admin@123',
    role: 'Admin'
  },
  planManagers: [
    {
      username: 'Green Arc',
      email: 'greenarc@radheconsultancy.co.in',
      password: 'GreenArc@123',
      role: 'Plan_manager'
    },
    {
      username: 'Little Star',
      email: 'littlestar@radheconsultancy.co.in',
      password: 'LittleStar@123',
      role: 'Plan_manager'
    }
  ],
  stabilityManagers: [
    {
      username: 'Jayeshbhai A Kataria',
      email: 'jayeshbhai@radheconsultancy.co.in',
      password: 'Jayeshbhai@123',
      role: 'Stability_manager'
    },
    {
      username: 'Samir G. Davda',
      email: 'samir@radheconsultancy.co.in',
      password: 'Samir@123',
      role: 'Stability_manager'
    }
  ]
};

// Check if account exists
async function checkAccount(email) {
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      return { exists: true, user, needsUpdate: false };
    }
    return { exists: false, user: null, needsUpdate: false };
  } catch (error) {
    console.error(`Error checking account ${email}:`, error.message);
    return { exists: false, user: null, needsUpdate: false };
  }
}

// Create or update account
async function createOrUpdateAccount(accountData) {
  try {
    const { username, email, password, role } = accountData;
    
    // Check if account exists
    const { exists, user } = await checkAccount(email);
    
    if (exists) {
      // Account exists, don't update - just return success
      logToFile(`ℹ️  Account already exists: ${username} (${email}) - skipping update`);
      console.log(`ℹ️  Account already exists: ${username} (${email}) - skipping update`);
      
      return { success: true, action: 'exists', user };
    } else {
      // Create new account only if it doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      logToFile(`✅ Created new account: ${username} (${email})`);
      console.log(`✅ Created new account: ${username} (${email})`);
      
      return { success: true, action: 'created', user: newUser };
    }
  } catch (error) {
    const errorMessage = `❌ Error creating account ${accountData.username}: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    return { success: false, action: 'error', error: error.message };
  }
}

// Assign role to user
async function assignRoleToUser(user, roleName) {
  try {
    // Find the role
    const role = await Role.findOne({ where: { role_name: roleName } });
    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }
    
    // Check if user already has this role
    const existingUserRole = await UserRole.findOne({
      where: {
        user_id: user.user_id,
        role_id: role.id
      }
    });
    
    if (!existingUserRole) {
      // Assign role
      await user.addRole(role, { 
        through: { 
          is_primary: true,
          assigned_by: 1 // Admin user ID
        } 
      });
      
      logToFile(`✅ Role '${roleName}' assigned to ${user.username}`);
      console.log(`✅ Role '${roleName}' assigned to ${user.username}`);
      return true;
    } else {
      logToFile(`ℹ️  Role '${roleName}' already assigned to ${user.username}`);
      console.log(`ℹ️  Role '${roleName}' already assigned to ${user.username}`);
      return true;
    }
  } catch (error) {
    const errorMessage = `❌ Error assigning role '${roleName}' to ${user.username}: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    return false;
  }
}

// Main function to create all accounts
async function createAllAccounts() {
  try {
    logToFile('🚀 Starting account creation process...');
    console.log('🚀 Starting account creation process...');
    
    // Ensure database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Process admin account
    console.log('\n📋 Processing Admin Account...');
    const adminResult = await createOrUpdateAccount(requiredAccounts.admin);
    if (adminResult.success) {
      if (adminResult.action === 'created') {
        await assignRoleToUser(adminResult.user, 'Admin');
      } else if (adminResult.action === 'exists') {
        console.log(`ℹ️  Admin account already exists, checking role assignment...`);
        // Check if role is already assigned
        const existingRole = await UserRole.findOne({
          where: { user_id: adminResult.user.user_id },
          include: [{ model: Role, where: { role_name: 'Admin' } }]
        });
        if (!existingRole) {
          await assignRoleToUser(adminResult.user, 'Admin');
        } else {
          console.log(`ℹ️  Admin role already assigned to ${adminResult.user.username}`);
        }
      }
    }

    // Process plan managers
    console.log('\n📋 Processing Plan Managers...');
    for (const manager of requiredAccounts.planManagers) {
      const result = await createOrUpdateAccount(manager);
      if (result.success) {
        if (result.action === 'created') {
          await assignRoleToUser(result.user, 'Plan_manager');
        } else if (result.action === 'exists') {
          console.log(`ℹ️  Plan manager account already exists, checking role assignment...`);
          // Check if role is already assigned
          const existingRole = await UserRole.findOne({
            where: { user_id: result.user.user_id },
            include: [{ model: Role, where: { role_name: 'Plan_manager' } }]
          });
          if (!existingRole) {
            await assignRoleToUser(result.user, 'Plan_manager');
          } else {
            console.log(`ℹ️  Plan_manager role already assigned to ${result.user.username}`);
          }
        }
      }
    }

    // Process stability managers
    console.log('\n📋 Processing Stability Managers...');
    for (const manager of requiredAccounts.stabilityManagers) {
      const result = await createOrUpdateAccount(manager);
      if (result.success) {
        if (result.action === 'created') {
          await assignRoleToUser(result.user, 'Stability_manager');
        } else if (result.action === 'exists') {
          console.log(`ℹ️  Stability manager account already exists, checking role assignment...`);
          // Check if role is already assigned
          const existingRole = await UserRole.findOne({
            where: { user_id: result.user.user_id },
            include: [{ model: Role, where: { role_name: 'Stability_manager' } }]
          });
          if (!existingRole) {
            await assignRoleToUser(result.user, 'Stability_manager');
          } else {
            console.log(`ℹ️  Stability_manager role already assigned to ${result.user.username}`);
          }
        }
      }
    }
    
    // Display summary
    console.log('\n📊 Account Summary:');
    console.log('================================');
    
    // Check all accounts and display their status
    const allAccounts = [
      requiredAccounts.admin,
      ...requiredAccounts.planManagers,
      ...requiredAccounts.stabilityManagers
    ];
    
    for (const account of allAccounts) {
      const { exists, user } = await checkAccount(account.email);
      if (exists) {
        console.log(`✅ ${account.username} (${account.email}) - ${account.role} - Account exists`);
      } else {
        console.log(`❌ ${account.username} (${account.email}) - ${account.role} - Account missing`);
      }
    }
    
    console.log('\n💡 Note: Existing accounts are preserved and not updated');
    console.log('   Only missing accounts will be created');
    
    logToFile('🎉 Account creation process completed successfully');
    console.log('\n🎉 Account creation process completed successfully!');
    console.log(`📝 Logs saved to: ${accountLogPath}`);
    
    return true;
  } catch (error) {
    const errorMessage = `❌ Account creation failed: ${error.message}`;
    logToFile(errorMessage);
    console.error(errorMessage);
    return false;
  }
}

// Export functions
module.exports = {
  createAllAccounts,
  createOrUpdateAccount,
  assignRoleToUser,
  checkAccount
};

// Run if this file is run directly
if (require.main === module) {
  createAllAccounts()
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
