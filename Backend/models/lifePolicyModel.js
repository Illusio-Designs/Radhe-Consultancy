const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const InsuranceCompany = require('./insuranceCompanyModel');
const Company = require('./companyModel');
const Consumer = require('./consumerModel');

const LifePolicy = sequelize.define('LifePolicy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: false
  },
  plan_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sub_product: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pt: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  ppt: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  policy_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  issue_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  current_policy_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  policy_document_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'LifePolicies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  modelName: 'LifePolicy',
  indexes: [
    {
      unique: true,
      fields: ['current_policy_number']
    }
  ]
});

module.exports = LifePolicy; 