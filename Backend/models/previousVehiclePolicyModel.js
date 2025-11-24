// PreviousVehiclePolicy Model
// This model stores historical/previous vehicle insurance policies
// when they are renewed. Multiple previous policies can exist for the same company/consumer.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const InsuranceCompany = require('./insuranceCompanyModel');
const Company = require('./companyModel');
const Consumer = require('./consumerModel');

const PreviousVehiclePolicy = sequelize.define('PreviousVehiclePolicy', {
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
  organisation_or_holder_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  policy_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: true
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
      },
      isAfterStartDate(value) {
        if (!this.policy_start_date || !value) {
          return;
        }
        const startDate = new Date(this.policy_start_date);
        const endDate = new Date(value);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date format provided');
        }
        if (endDate <= startDate) {
          throw new Error('Policy end date must be after start date');
        }
      }
    }
  },
  sub_product: {
    type: DataTypes.ENUM('Two Wheeler', 'Private car', 'Passanger Vehicle', 'Goods Vehicle', 'Misc - D Vehicle', 'Standalone CPA'),
    allowNull: false
  },
  vehicle_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  segment: {
    type: DataTypes.ENUM('Comprehensive', 'TP Only', 'SAOD'),
    allowNull: false
  },
  manufacturing_company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  manufacturing_year: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idv: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
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
  tableName: 'PreviousVehiclePolicies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  modelName: 'PreviousVehiclePolicy',
  indexes: [
    { unique: true, fields: ['policy_number'] },
    { fields: ['company_id'] },
    { fields: ['consumer_id'] },
    { fields: ['insurance_company_id'] },
    { fields: ['policy_end_date'] },
    { fields: ['original_policy_id'] },
    { fields: ['renewed_at'] }
  ],
  hooks: {
    beforeValidate: (policy, options) => {
      if (policy.policy_start_date && typeof policy.policy_start_date === 'string') {
        policy.policy_start_date = new Date(policy.policy_start_date);
      }
      if (policy.policy_end_date && typeof policy.policy_end_date === 'string') {
        policy.policy_end_date = new Date(policy.policy_end_date);
      }
      if (typeof policy.net_premium === 'string') {
        policy.net_premium = parseFloat(policy.net_premium);
      }
      if (typeof policy.gst === 'string') {
        policy.gst = parseFloat(policy.gst);
      }
      if (typeof policy.gross_premium === 'string') {
        policy.gross_premium = parseFloat(policy.gross_premium);
      }
      if (typeof policy.idv === 'string') {
        policy.idv = parseFloat(policy.idv);
      }
    },
    beforeCreate: async (policy) => {
      const calculatedGross = parseFloat(policy.net_premium) + parseFloat(policy.gst);
      if (Math.abs(calculatedGross - parseFloat(policy.gross_premium)) > 0.01) {
        throw new Error('Gross premium must equal net premium plus GST');
      }
    }
  }
});

module.exports = PreviousVehiclePolicy;

