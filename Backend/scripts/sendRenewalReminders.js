const { EmployeeCompensationPolicy, VehiclePolicy, HealthPolicy, FirePolicy, LifePolicy, DSC, Company, Consumer, ReminderLog } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email'); // Assume you have a utility for sending emails

const getRemindables = async (Model, dateField, include) => {
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + 15);
  return await Model.findAll({
    where: {
      [dateField]: {
        [Op.gte]: now,
        [Op.lte]: future
      }
    },
    include
  });
};

const shouldSendReminder = (reminderLogs, policyId, type) => {
  // Find logs for this policy/type in the last 15 days
  const logs = reminderLogs.filter(log => log.policy_id === policyId && log.policy_type === type);
  return logs.length < 5;
};

const sendRenewalReminders = async () => {
  // Fetch all reminder logs from last 15 days
  const since = new Date();
  since.setDate(since.getDate() - 15);
  const reminderLogs = await ReminderLog.findAll({ where: { sent_at: { [Op.gte]: since } } });

  // Policy types and configs
  const configs = [
    { Model: EmployeeCompensationPolicy, dateField: 'end_date', type: 'ECP', include: [{ model: Company, as: 'policyHolder' }] },
    { Model: FirePolicy, dateField: 'end_date', type: 'Fire', include: [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }] },
    { Model: HealthPolicy, dateField: 'end_date', type: 'Health', include: [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }] },
    { Model: VehiclePolicy, dateField: 'end_date', type: 'Vehicle', include: [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }] },
    { Model: LifePolicy, dateField: 'end_date', type: 'Life', include: [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }] },
    { Model: DSC, dateField: 'expiry_date', type: 'DSC', include: [{ model: Company, as: 'company' }, { model: Consumer, as: 'consumer' }] },
  ];

  for (const { Model, dateField, type, include } of configs) {
    const items = await getRemindables(Model, dateField, include);
    for (const item of items) {
      if (shouldSendReminder(reminderLogs, item.id, type)) {
        let email = null;
        if (item.policyHolder && item.policyHolder.email) email = item.policyHolder.email;
        if (item.companyPolicyHolder && item.companyPolicyHolder.email) email = item.companyPolicyHolder.email;
        if (item.consumerPolicyHolder && item.consumerPolicyHolder.email) email = item.consumerPolicyHolder.email;
        if (item.company && item.company.email) email = item.company.email;
        if (item.consumer && item.consumer.email) email = item.consumer.email;
        if (!email) email = 'admin@example.com';
        // Compose reminder message
        const message = `Reminder: Your ${type} policy (ID: ${item.id}) is due for renewal on ${item[dateField]}.`;
        // Send email (customize as needed)
        await sendEmail(email, `${type} Policy Renewal Reminder`, message);
        // Log the reminder
        await ReminderLog.create({
          policy_id: item.id,
          policy_type: type,
          sent_at: new Date()
        });
      }
    }
  }
  console.log('Renewal reminders sent.');
};

// If run directly
if (require.main === module) {
  sendRenewalReminders().then(() => process.exit(0));
}

// ReminderLog schema suggestion (if not present):
// policy_id: integer
// policy_type: string
// sent_at: datetime

module.exports = { sendRenewalReminders }; 