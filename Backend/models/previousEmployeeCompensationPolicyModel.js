// PreviousEmployeeCompensationPolicy Model
// This model stores historical/previous employee compensation insurance policies
// when they are renewed. Multiple previous policies can exist for the same company/consumer.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const InsuranceCompany = require('./insuranceCompanyModel');
const Company = require('./companyModel');

const PreviousEmployeeCompensationPolicy = sequelize.define('PreviousEmployeeCompensationPolicy', {
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
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'company_id'
    }
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
    allowNull: false,
    validate: {
      is: /^\+?[1-9]\d{1,14}$/ // E.164 format
    }
  },
  policy_start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      notNull: {
        msg: 'Policy start date is required'
      }
    }
  },
  policy_end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      notNull: {
        msg: 'Policy end date is required'
      }
    }
  },
  medical_cover: {
    type: DataTypes.ENUM('25k', '50k', '1 lac', '2 lac', '3 lac', '5 lac', 'actual'),
    allowNull: false
  },
  gst_number: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/ // GST format
    }
  },
  pan_number: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ // PAN format
    }
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
    allowNull: false,
    validate: {
      notEmpty: true
    }
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
  tableName: 'PreviousEmployeeCompensationPolicies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  modelName: 'PreviousEmployeeCompensationPolicy',
  indexes: [
    {
      fields: ['company_id']
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
    }
  ],
  hooks: {
    beforeValidate: (policy, options) => {
      // Ensure dates are properly parsed
      if (policy.policy_start_date && typeof policy.policy_start_date === 'string') {
        policy.policy_start_date = new Date(policy.policy_start_date);
      }
      if (policy.policy_end_date && typeof policy.policy_end_date === 'string') {
        policy.policy_end_date = new Date(policy.policy_end_date);
      }
      if (policy.renewed_at && typeof policy.renewed_at === 'string') {
        policy.renewed_at = new Date(policy.renewed_at);
      }

      // Convert string numbers to decimals if needed
      if (typeof policy.net_premium === 'string') {
        policy.net_premium = parseFloat(policy.net_premium);
      }
      if (typeof policy.gst === 'string') {
        policy.gst = parseFloat(policy.gst);
      }
      if (typeof policy.gross_premium === 'string') {
        policy.gross_premium = parseFloat(policy.gross_premium);
      }
    }
  }
});

module.exports = PreviousEmployeeCompensationPolicy;

