const sequelize = require('../config/db');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const UserRoleWorkLog = require('../models/userRoleWorkLogModel');

async function analyzeForeignKeys() {
  try {
    console.log('Analyzing foreign key violations in user_role_work_logs table...\n');
    
    // Get all log entries
    const logs = await UserRoleWorkLog.findAll({
      order: [['id', 'ASC']]
    });
    
    console.log(`Found ${logs.length} log entries to analyze\n`);
    
    let validLogs = 0;
    let invalidLogs = 0;
    let companyIdLogs = 0;
    let consumerIdLogs = 0;
    let nullLogs = 0;
    
    const violations = [];
    
    for (const log of logs) {
      try {
        console.log(`Analyzing log ${log.id}: action=${log.action}, target_user_id=${log.target_user_id}`);
        
        if (!log.target_user_id) {
          console.log(`  → NULL target_user_id (skipping)`);
          nullLogs++;
          continue;
        }
        
        // Check if target_user_id exists in Users table
        const user = await sequelize.models.User.findByPk(log.target_user_id);
        if (user) {
          console.log(`  ✓ Valid user: ${user.email}`);
          validLogs++;
          continue;
        }
        
        // If not a valid user, check if it's a company_id
        const company = await Company.findByPk(log.target_user_id);
        if (company) {
          console.log(`  ✗ INVALID: target_user_id ${log.target_user_id} is actually company_id ${company.company_id} (${company.company_name})`);
          console.log(`    → Company has user_id: ${company.user_id}`);
          
          if (company.user_id) {
            violations.push({
              logId: log.id,
              currentValue: log.target_user_id,
              shouldBe: company.user_id,
              type: 'company',
              companyName: company.company_name,
              action: log.action
            });
            companyIdLogs++;
          } else {
            console.log(`    ⚠ Company has no user_id - cannot fix automatically`);
          }
        } else {
          // Check if it's a consumer_id
          const consumer = await Consumer.findByPk(log.target_user_id);
          if (consumer) {
            console.log(`  ✗ INVALID: target_user_id ${log.target_user_id} is actually consumer_id ${consumer.consumer_id}`);
            console.log(`    → Consumer has user_id: ${consumer.user_id}`);
            
            if (consumer.user_id) {
              violations.push({
                logId: log.id,
                currentValue: log.target_user_id,
                shouldBe: consumer.user_id,
                type: 'consumer',
                consumerName: consumer.consumer_name,
                action: log.action
              });
              consumerIdLogs++;
            } else {
              console.log(`    ⚠ Consumer has no user_id - cannot fix automatically`);
            }
          } else {
            console.log(`  ✗ INVALID: target_user_id ${log.target_user_id} is neither a valid user_id, company_id, nor consumer_id`);
            invalidLogs++;
          }
        }
        
      } catch (error) {
        console.error(`  ✗ Error analyzing log ${log.id}:`, error.message);
      }
    }
    
    console.log(`\n=== ANALYSIS SUMMARY ===`);
    console.log(`Total logs: ${logs.length}`);
    console.log(`Valid logs: ${validLogs}`);
    console.log(`Invalid logs: ${invalidLogs}`);
    console.log(`Company ID violations: ${companyIdLogs}`);
    console.log(`Consumer ID violations: ${consumerIdLogs}`);
    console.log(`Null target_user_id: ${nullLogs}`);
    
    if (violations.length > 0) {
      console.log(`\n=== FOREIGN KEY VIOLATIONS FOUND ===`);
      violations.forEach(violation => {
        if (violation.type === 'company') {
          console.log(`Log ${violation.logId} (${violation.action}): ${violation.currentValue} -> ${violation.shouldBe} (${violation.companyName})`);
        } else {
          console.log(`Log ${violation.logId} (${violation.action}): ${violation.currentValue} -> ${violation.shouldBe} (${violation.consumerName})`);
        }
      });
      
      console.log(`\nThese violations can be fixed automatically.`);
    } else {
      console.log(`\n✓ No foreign key violations found!`);
    }
    
  } catch (error) {
    console.error('Error analyzing foreign keys:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the analysis
analyzeForeignKeys();
