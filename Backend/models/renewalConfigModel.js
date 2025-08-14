
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
      comment: 'Type of service (e.g., vehicle, ecp, health, fire, dsc, factory)'
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Display name for the service'
    },
    reminderTimes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'How many times to send reminders'
    },
    reminderDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'How many days before expiry to send reminders'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this configuration is active'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User ID who created this configuration'
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
