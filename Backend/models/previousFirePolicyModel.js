// PreviousFirePolicy Model
// This model stores historical/previous fire insurance policies
// when they are renewed. Multiple previous policies can exist for the same company/consumer.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const InsuranceCompany = require('./insuranceCompanyModel');
const Company = require('./companyModel');
const Consumer = require('./consumerModel');

const PreviousFirePolicy = sequelize.define('PreviousFirePolicy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  original_policy_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reference to the original policy ID before it was moved to previous'
  },
  business_type: {
    type: DataTypes.ENUM('Fresh/New', 'Renewal/Rollover', 'Endorsement'),
    allowNull: false
  },
  customer_type: {
    type: DataTypes.ENUM('Organisation', 'Individual'),
    allowNull: false
  },
  insurance_company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: InsuranceCompany,
      key: 'id'
    }
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Companies',
      key: 'company_id'
    }
  },
  consumer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Consumers',
      key: 'consumer_id'
    }
  },
  proposer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  policy_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  policy_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  policy_end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  total_sum_insured: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  gst_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pan_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  net_premium: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  gst: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  gross_premium: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  policy_document_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'expired',
    comment: 'Status when the policy was moved to previous (usually expired)'
  },
  renewed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date when this policy was renewed and moved to previous'
  }
}, {
  tableName: 'PreviousFirePolicies',
  timestamps: true,
  indexes: [
    {
      fields: ['policy_number']
    },
    {
      fields: ['company_id']
    },
    {
      fields: ['consumer_id']
    },
    {
      fields: ['insurance_company_id']
    },
    {
      fields: ['policy_end_date']
    },
    {
      fields: ['original_policy_id']
    },
    {
      fields: ['renewed_at']
    },
    {
      fields: ['policy_start_date', 'policy_end_date']
    },
    {
      fields: ['total_sum_insured']
    }
  ]
});

module.exports = PreviousFirePolicy;