module.exports = (sequelize, DataTypes) => {
  const VehicleInsurance = sequelize.define('VehicleInsurance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to client/company'
    },
    policyNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Insurance policy number'
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Vehicle registration number'
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type of vehicle (Car, Bike, Truck, etc.)'
    },
    vehicleMake: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Vehicle make/brand'
    },
    vehicleModel: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Vehicle model'
    },
    insuranceCompany: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of insurance company'
    },
    policyType: {
      type: DataTypes.ENUM('Comprehensive', 'Third Party', 'Third Party Fire & Theft'),
      allowNull: false,
      defaultValue: 'Comprehensive',
      comment: 'Type of insurance policy'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Policy start date'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Policy expiry date'
    },
    renewalDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Next renewal date'
    },
    premiumAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Insurance premium amount'
    },
    renewalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Expected renewal amount'
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'renewed', 'cancelled', 'pending'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Current status of the policy'
    },
    lastReminderSent: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when last reminder was sent'
    },
    nextReminderDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Next scheduled reminder date'
    },
    reminderHistory: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of reminder history with dates and types'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about the policy'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User ID who created this record'
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID assigned to handle this policy'
    }
  }, {
    tableName: 'vehicle_insurances',
    timestamps: true,
    indexes: [
      {
        fields: ['clientId']
      },
      {
        fields: ['expiryDate']
      },
      {
        fields: ['status']
      },
      {
        fields: ['nextReminderDate']
      },
      {
        unique: true,
        fields: ['policyNumber']
      }
    ]
  });

  // Instance methods
  VehicleInsurance.prototype.getDaysUntilExpiry = function() {
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  VehicleInsurance.prototype.isExpired = function() {
    return this.getDaysUntilExpiry() < 0;
  };

  VehicleInsurance.prototype.isExpiringSoon = function(days = 30) {
    const daysUntilExpiry = this.getDaysUntilExpiry();
    return daysUntilExpiry >= 0 && daysUntilExpiry <= days;
  };

  VehicleInsurance.prototype.addReminderToHistory = function(reminderType, sentDate, daysUntilExpiry) {
    if (!this.reminderHistory) {
      this.reminderHistory = [];
    }
    
    this.reminderHistory.push({
      type: reminderType,
      sentDate: sentDate,
      daysUntilExpiry: daysUntilExpiry,
      timestamp: new Date()
    });
  };

  // Class methods
  VehicleInsurance.getExpiringPolicies = function(days = 30) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    return this.findAll({
      where: {
        expiryDate: {
          [sequelize.Op.lte]: targetDate
        },
        status: 'active'
      },
      order: [['expiryDate', 'ASC']]
    });
  };

  VehicleInsurance.getPoliciesNeedingReminders = function() {
    const today = new Date();
    
    return this.findAll({
      where: {
        status: 'active',
        [sequelize.Op.or]: [
          { nextReminderDate: { [sequelize.Op.lte]: today } },
          { nextReminderDate: null }
        ]
      },
      order: [['expiryDate', 'ASC']]
    });
  };

  return VehicleInsurance;
};
