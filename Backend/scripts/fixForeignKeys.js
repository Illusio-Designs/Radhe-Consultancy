const sequelize = require('../config/db');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const UserRoleWorkLog = require('../models/userRoleWorkLogModel');

async function fixForeignKeys() {
  try {
    console.log('Fixing foreign key violations in user_role_work_logs table...\n');
    
    // Get all log entries
    const logs = await UserRoleWorkLog.findAll();
    console.log(`Found ${logs.length} log entries to check`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const log of logs) {
      try {
        let newTargetUserId = null;
        let sourceType = null;
        
        // Check if the current target_user_id is actually a company_id
        if (log.target_user_id) {
          const company = await Company.findByPk(log.target_user_id);
          if (company) {
            // This target_user_id is actually a company_id, we need to fix it
            if (company.user_id) {
              newTargetUserId = company.user_id;
              sourceType = 'company';
              console.log(`  Found company ${log.target_user_id} (${company.company_name}) -> user_id: ${company.user_id}`);
            } else {
              console.log(`  Company ${log.target_user_id} (${company.company_name}) has no user_id`);
            }
          } else {
            // Check if it's a valid user_id by trying to find a user
            const user = await sequelize.models.User.findByPk(log.target_user_id);
            if (user) {
              console.log(`  Target user ${log.target_user_id} is valid, skipping`);
              skippedCount++;
              continue;
            } else {
              console.log(`  Target user ${log.target_user_id} is invalid and not a company_id`);
            }
          }
        }
        
        // If we found a new target_user_id, update the log
        if (newTargetUserId) {
          await log.update({
            target_user_id: newTargetUserId
          });
          
          console.log(`  ✓ Fixed log ${log.id}: ${log.target_user_id} -> ${newTargetUserId} (from ${sourceType})`);
          fixedCount++;
        } else {
          console.log(`  ⚠ Could not resolve target_user_id for log ${log.id}`);
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`  ✗ Error processing log ${log.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`  Fixed: ${fixedCount} logs`);
    console.log(`  Skipped: ${skippedCount} logs`);
    console.log(`  Errors: ${errorCount} logs`);
    
    if (fixedCount > 0) {
      console.log(`\nSuccessfully fixed ${fixedCount} foreign key violations!`);
    } else {
      console.log(`\nNo foreign key violations found to fix.`);
    }
    
  } catch (error) {
    console.error('Error fixing foreign keys:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixForeignKeys();
