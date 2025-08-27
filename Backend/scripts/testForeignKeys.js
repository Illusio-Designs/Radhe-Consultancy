const sequelize = require('../config/db');
const Company = require('../models/companyModel');
const User = require('../models/userModel');
const UserRoleWorkLog = require('../models/userRoleWorkLogModel');

async function testForeignKeys() {
  try {
    console.log('Testing foreign key relationships...\n');
    
    // Test 1: Check if companies have valid user_id references
    console.log('1. Checking company user_id references...');
    const companies = await Company.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'email']
      }]
    });
    
    console.log(`Found ${companies.length} companies`);
    companies.forEach(company => {
      if (company.user) {
        console.log(`  ✓ Company ${company.company_id} (${company.company_name}) -> User ${company.user_id} (${company.user.email})`);
      } else {
        console.log(`  ✗ Company ${company.company_id} (${company.company_name}) -> INVALID user_id: ${company.user_id}`);
      }
    });
    
    // Test 2: Check UserRoleWorkLog entries for foreign key violations
    console.log('\n2. Checking UserRoleWorkLog foreign key constraints...');
    const logs = await UserRoleWorkLog.findAll({
      include: [{
        model: User,
        as: 'targetUser',
        attributes: ['user_id', 'email']
      }]
    });
    
    console.log(`Found ${logs.length} log entries`);
    let validLogs = 0;
    let invalidLogs = 0;
    
    logs.forEach(log => {
      if (log.targetUser) {
        validLogs++;
        console.log(`  ✓ Log ${log.id} -> Target User ${log.target_user_id} (${log.targetUser.email})`);
      } else {
        invalidLogs++;
        console.log(`  ✗ Log ${log.id} -> INVALID target_user_id: ${log.target_user_id}`);
      }
    });
    
    console.log(`\nSummary: ${validLogs} valid logs, ${invalidLogs} invalid logs`);
    
    // Test 3: Check specific problematic IDs from the error logs
    console.log('\n3. Checking specific problematic IDs from error logs...');
    const problematicIds = [2, 245, 217];
    
    for (const id of problematicIds) {
      const user = await User.findByPk(id);
      if (user) {
        console.log(`  ✓ User ${id} exists: ${user.email}`);
      } else {
        console.log(`  ✗ User ${id} does NOT exist`);
      }
    }
    
    // Test 4: Check if there are companies with these IDs
    console.log('\n4. Checking if companies with these IDs exist...');
    for (const id of problematicIds) {
      const company = await Company.findByPk(id);
      if (company) {
        console.log(`  ✓ Company ${id} exists: ${company.company_name} -> user_id: ${company.user_id}`);
        
        // Check if the company's user_id exists
        if (company.user_id) {
          const user = await User.findByPk(company.user_id);
          if (user) {
            console.log(`    ✓ Company's user_id ${company.user_id} is valid: ${user.email}`);
          } else {
            console.log(`    ✗ Company's user_id ${company.user_id} is INVALID`);
          }
        } else {
          console.log(`    ✗ Company has no user_id`);
        }
      } else {
        console.log(`  ✗ Company ${id} does NOT exist`);
      }
    }
    
  } catch (error) {
    console.error('Error testing foreign keys:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testForeignKeys();
