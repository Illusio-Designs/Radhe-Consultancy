const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ReminderLog = sequelize.define('ReminderLog', {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  policy_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    comment: 'ID of the policy being reminded'
  },
  policy_type: { 
    type: DataTypes.STRING, 
    allowNull: false,
    comment: 'Type of policy (vehicle, health, fire, etc.)'
  },
  client_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of the client for quick reference'
  },
  client_email: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Email address where reminder was sent'
  },
  reminder_type: {
    type: DataTypes.ENUM('email', 'sms', 'whatsapp'),
    allowNull: false,
    defaultValue: 'email',
    comment: 'Type of reminder sent'
  },
  reminder_day: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Days before expiry when reminder was sent'
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Policy expiry date'
  },
  sent_at: { 
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the reminder was sent'
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'failed', 'opened', 'clicked'),
    allowNull: false,
    defaultValue: 'sent',
    comment: 'Status of the reminder delivery'
  },
  email_subject: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Subject line of the email sent'
  },
  response_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Response data from email service (messageId, etc.)'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if reminder failed'
  },
  days_until_expiry: { 
    type: DataTypes.INTEGER, 
    allowNull: true, 
    comment: 'Days remaining until expiry when reminder was sent' 
  }
}, { 
  tableName: 'ReminderLogs', 
  timestamps: true,
  indexes: [
    { fields: ['policy_id', 'policy_type'] },
    { fields: ['sent_at'] },
    { fields: ['status'] },
    { fields: ['reminder_type'] }
  ]
});

module.exports = ReminderLog; 