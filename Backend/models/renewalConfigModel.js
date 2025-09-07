
module.exports = (sequelize, DataTypes) => {
  const RenewalConfig = sequelize.define('RenewalConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serviceType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'service_type',
      comment: 'Type of service (e.g., vehicle, ecp, health, fire, dsc, factory)'
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'service_name',
      comment: 'Display name for the service'
    },
    reminderTimes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'reminder_times',
      comment: 'How many times to send reminders'
    },
    reminderDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'reminder_days',
      comment: 'How many days before expiry to start sending reminders'
    },
    reminderIntervals: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'reminder_intervals',
      comment: 'Dynamic reminder intervals (e.g., [30, 15, 7, 3, 1] days before expiry)'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_active',
      defaultValue: true,
      comment: 'Whether this configuration is active'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by',
      comment: 'User ID who created this configuration'
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'updated_by',
      comment: 'User ID who last updated this configuration'
    }
  }, {
    tableName: 'renewal_configs',
    timestamps: true,
    underscored: true, // Use snake_case to match global config
    indexes: [
      {
        unique: true,
        fields: ['serviceType']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  // Instance methods
  RenewalConfig.prototype.shouldSendReminder = function(daysUntilExpiry) {
    return daysUntilExpiry <= this.reminderDays;
  };

  // Calculate which reminder number should be sent based on days until expiry
  RenewalConfig.prototype.calculateReminderNumber = function(daysUntilExpiry) {
    if (!this.reminderIntervals || !Array.isArray(this.reminderIntervals)) {
      // Fallback to old logic
      if (daysUntilExpiry <= 7) return 3;
      if (daysUntilExpiry <= 15) return 2;
      return 1;
    }

    // Use dynamic intervals
    for (let i = 0; i < this.reminderIntervals.length; i++) {
      if (daysUntilExpiry <= this.reminderIntervals[i]) {
        return i + 1;
      }
    }
    return 0; // No reminder due
  };

  // Get next reminder date based on current reminder number
  RenewalConfig.prototype.getNextReminderDate = function(expiryDate, currentReminderNumber = 0) {
    if (!this.reminderIntervals || !Array.isArray(this.reminderIntervals)) {
      return null;
    }

    const expiry = new Date(expiryDate);
    if (currentReminderNumber >= this.reminderIntervals.length) {
      return null; // All reminders sent
    }

    const nextDays = this.reminderIntervals[currentReminderNumber];
    const nextDate = new Date(expiry);
    nextDate.setDate(expiry.getDate() - nextDays);
    
    return nextDate;
  };

  // Class methods
  RenewalConfig.getActiveConfigs = function() {
    return this.findAll({
      where: { isActive: true },
      order: [['serviceType', 'ASC']]
    });
  };

  RenewalConfig.getConfigByService = function(serviceType) {
    return this.findOne({
      where: { 
        serviceType: serviceType,
        isActive: true
      }
    });
  };

  return RenewalConfig;
};
