const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LabourInspectionReminder = sequelize.define('LabourInspectionReminder', {
  reminder_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inspection_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'LabourInspections',
      key: 'inspection_id'
    },
    comment: 'Reference to the labour inspection'
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'company_id'
    },
    comment: 'Reference to the company being reminded'
  },
  reminder_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Which reminder number this is (1-5)'
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
    comment: 'Days after notice date when this reminder was sent'
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
    comment: 'Status of the reminder'
  },
  email_subject: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Subject line of the email reminder'
  },
  email_content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Content of the email reminder'
  },
  response_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Response data from email service'
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
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'user_id'
    },
    comment: 'User who triggered the reminder'
  }
}, {
  tableName: 'LabourInspectionReminders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  modelName: 'LabourInspectionReminder',
  indexes: [
    {
      name: 'idx_inspection_reminder',
      fields: ['inspection_id', 'reminder_number']
    },
    {
      name: 'idx_company_reminder',
      fields: ['company_id', 'sent_at']
    },
    {
      name: 'idx_reminder_status',
      fields: ['status']
    },
    {
      name: 'idx_sent_at',
      fields: ['sent_at']
    }
  ]
});

module.exports = LabourInspectionReminder;
