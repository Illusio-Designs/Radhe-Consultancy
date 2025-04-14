const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const UserType = require('./userTypeModel');

const Consumer = sequelize.define('Consumer', {
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
  user_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'UserTypes',
      key: 'user_type_id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
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
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  national_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contact_address: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'consumers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define association with UserType
Consumer.belongsTo(UserType, { foreignKey: 'user_type_id' });
UserType.hasMany(Consumer, { foreignKey: 'user_type_id' });

module.exports = Consumer;