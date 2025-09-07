const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LabourLicense = sequelize.define('LabourLicense', {
    license_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the labour license'
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the company that holds this license'
    },
    license_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Official license number issued by authorities'
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Date when the license expires'
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'suspended', 'renewed'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Current status of the license'
    },
    type: {
      type: DataTypes.ENUM('Central', 'State'),
      allowNull: false,
      defaultValue: 'State',
      comment: 'Type of labour license - Central or State'
    },


  }, {
    tableName: 'labour_licenses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['license_number']
      },
      {
        fields: ['company_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['expiry_date']
      }
    ]
  });

  // Define associations
  LabourLicense.associate = (models) => {
    LabourLicense.belongsTo(models.Company, {
      foreignKey: 'company_id',
      as: 'company',
      onDelete: 'CASCADE'
    });
  };

  // Hooks for automatic status updates
  LabourLicense.addHook('beforeSave', (license) => {
    if (license.expiry_date) {
      const today = new Date();
      const expiryDate = new Date(license.expiry_date);
      
      if (expiryDate < today) {
        license.status = 'expired';
      } else if (license.status === 'expired' && expiryDate > today) {
        license.status = 'active';
      }
    }
  });

  return LabourLicense;
};
