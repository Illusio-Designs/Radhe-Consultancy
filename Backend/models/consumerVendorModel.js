const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const ConsumerVendor = sequelize.define('ConsumerVendor', {
  consumer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vendors',
      key: 'vendor_id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other', 'Not Specified'),
    allowNull: false,
    defaultValue: 'Not Specified'
  },
  national_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact_address: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'ConsumerVendors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ConsumerVendor; 