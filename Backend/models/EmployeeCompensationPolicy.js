const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Company = require('./companyModel');
const InsuranceCompany = require('./InsuranceCompany');

const EmployeeCompensationPolicy = sequelize.define('EmployeeCompensationPolicy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  businessType: {
    type: DataTypes.ENUM('Fresh/New', 'Renewal/Rollover', 'Endorsement'),
    allowNull: false,
  },
  customerType: {
    type: DataTypes.ENUM('Organisation', 'Individual'),
    allowNull: false,
  },
  insuranceCompanyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'InsuranceCompanies',
      key: 'id'
    }
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'id'
    }
  },
  policyNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  policyStartDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  policyEndDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  medicalCover: {
    type: DataTypes.ENUM('25k', '50k', '1 lac', '2 lac', '3 lac', '5 lac', 'actual'),
    allowNull: false,
  },
  gstNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  panNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  netPremium: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  gst: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  grossPremium: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  policyDocumentPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'active',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

// Define associations
EmployeeCompensationPolicy.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company'
});

EmployeeCompensationPolicy.belongsTo(InsuranceCompany, {
  foreignKey: 'insuranceCompanyId',
  as: 'insuranceCompany'
});

// Hooks for calculating gross premium
EmployeeCompensationPolicy.beforeCreate(async (policy) => {
  policy.gst = (policy.netPremium * 0.18).toFixed(2);
  policy.grossPremium = (parseFloat(policy.netPremium) + parseFloat(policy.gst)).toFixed(2);
});

EmployeeCompensationPolicy.beforeUpdate(async (policy) => {
  if (policy.changed('netPremium')) {
    policy.gst = (policy.netPremium * 0.18).toFixed(2);
    policy.grossPremium = (parseFloat(policy.netPremium) + parseFloat(policy.gst)).toFixed(2);
  }
});

module.exports = EmployeeCompensationPolicy; 