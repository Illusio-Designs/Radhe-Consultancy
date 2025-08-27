const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Company = require('./companyModel');

const LabourInspection = sequelize.define('LabourInspection', {
  inspection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Company,
      key: 'company_id'
    },
    comment: 'Reference to the company being inspected'
  },
  document_upload: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path to uploaded inspection document'
  },
  document_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Original name of the uploaded document'
  },
  date_of_notice: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Date when the inspection notice was issued'
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Expiry date (15 days after notice date)'
  },
  officer_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the inspection officer'
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'complete'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Current status of the inspection'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional remarks or notes about the inspection'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User ID who created this inspection record'
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID who last updated this inspection record'
  }
}, {
  tableName: 'LabourInspections',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  modelName: 'LabourInspection',
  hooks: {
    beforeCreate: (inspection, options) => {
      console.log('[LabourInspection] beforeCreate hook triggered');
      console.log('[LabourInspection] date_of_notice:', inspection.date_of_notice);
      
      // Ensure date_of_notice is a valid date
      if (inspection.date_of_notice) {
        const noticeDate = new Date(inspection.date_of_notice);
        if (!isNaN(noticeDate.getTime())) {
          // Calculate expiry date (15 days after notice date)
          const expiryDate = new Date(noticeDate);
          expiryDate.setDate(expiryDate.getDate() + 15);
          
          inspection.expiry_date = expiryDate;
          console.log('[LabourInspection] Calculated expiry_date:', inspection.expiry_date);
        } else {
          console.error('[LabourInspection] Invalid date_of_notice:', inspection.date_of_notice);
        }
      } else {
        console.error('[LabourInspection] date_of_notice is missing or null');
      }
    },
    
    beforeUpdate: (inspection, options) => {
      console.log('[LabourInspection] beforeUpdate hook triggered');
      console.log('[LabourInspection] date_of_notice changed:', inspection.changed('date_of_notice'));
      
      // Update expiry date if notice date changes
      if (inspection.changed('date_of_notice') && inspection.date_of_notice) {
        const noticeDate = new Date(inspection.date_of_notice);
        if (!isNaN(noticeDate.getTime())) {
          const expiryDate = new Date(noticeDate);
          expiryDate.setDate(expiryDate.getDate() + 15);
          
          inspection.expiry_date = expiryDate;
          console.log('[LabourInspection] Updated expiry_date:', inspection.expiry_date);
        }
      }
    },
    
    beforeValidate: (inspection, options) => {
      console.log('[LabourInspection] beforeValidate hook triggered');
      console.log('[LabourInspection] Current data:', {
        date_of_notice: inspection.date_of_notice,
        expiry_date: inspection.expiry_date
      });
      
      // Ensure expiry_date is set before validation
      if (!inspection.expiry_date && inspection.date_of_notice) {
        const noticeDate = new Date(inspection.date_of_notice);
        if (!isNaN(noticeDate.getTime())) {
          const expiryDate = new Date(noticeDate);
          expiryDate.setDate(expiryDate.getDate() + 15);
          
          inspection.expiry_date = expiryDate;
          console.log('[LabourInspection] Set expiry_date in beforeValidate:', inspection.expiry_date);
        }
      }
    }
  }
});

module.exports = LabourInspection;
