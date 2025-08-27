const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');

/**
 * Safely creates a UserRoleWorkLog entry by resolving the correct target_user_id
 * from company_id or consumer_id instead of using them directly
 * @param {Object} logData - The log data object
 * @param {number} logData.user_id - The user ID performing the action
 * @param {number} logData.company_id - The company ID (optional)
 * @param {number} logData.consumer_id - The consumer ID (optional)
 * @param {number} logData.role_id - The role ID (optional)
 * @param {string} logData.action - The action being logged
 * @param {Object} logData.details - The details object to be stringified
 * @param {Function} UserRoleWorkLog - The UserRoleWorkLog model
 * @returns {Promise<Object|null>} - The created log entry or null if failed
 */
async function createSafeUserRoleWorkLog(logData, UserRoleWorkLog) {
  try {
    let targetUserId = null;
    
    // Try to resolve target_user_id from company_id first
    if (logData.company_id) {
      const company = await Company.findByPk(logData.company_id);
      if (company && company.user_id) {
        targetUserId = company.user_id;
      }
    }
    
    // If no company user_id found, try consumer_id
    if (!targetUserId && logData.consumer_id) {
      const consumer = await Consumer.findByPk(logData.consumer_id);
      if (consumer && consumer.user_id) {
        targetUserId = consumer.user_id;
      }
    }
    
    // Only create log if we have a valid target_user_id
    if (targetUserId) {
      const logEntry = await UserRoleWorkLog.create({
        user_id: logData.user_id || null,
        target_user_id: targetUserId,
        role_id: logData.role_id || null,
        action: logData.action,
        details: JSON.stringify(logData.details)
      });
      
      console.log(`[LOGGING] Successfully created log for action: ${logData.action}`);
      return logEntry;
    } else {
      console.warn(`[LOGGING] Skipping log creation - no valid target_user_id found for company_id: ${logData.company_id}, consumer_id: ${logData.consumer_id}`);
      return null;
    }
  } catch (error) {
    console.error('[LOGGING] Error creating user role work log:', error);
    // Don't fail the main operation if logging fails
    return null;
  }
}

/**
 * Resolves the target_user_id from company_id or consumer_id
 * @param {number} company_id - The company ID
 * @param {number} consumer_id - The consumer ID
 * @returns {Promise<number|null>} - The resolved user ID or null
 */
async function resolveTargetUserId(company_id, consumer_id) {
  try {
    let targetUserId = null;
    
    if (company_id) {
      const company = await Company.findByPk(company_id);
      if (company && company.user_id) {
        targetUserId = company.user_id;
      }
    }
    
    if (!targetUserId && consumer_id) {
      const consumer = await Consumer.findByPk(consumer_id);
      if (consumer && consumer.user_id) {
        targetUserId = consumer.user_id;
      }
    }
    
    return targetUserId;
  } catch (error) {
    console.error('[LOGGING] Error resolving target user ID:', error);
    return null;
  }
}

module.exports = {
  createSafeUserRoleWorkLog,
  resolveTargetUserId
};
