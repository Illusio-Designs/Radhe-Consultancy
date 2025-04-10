const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const UserType = require('./userTypeModel'); // Add this import

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
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
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2, // Default to User role
    references: {
      model: 'Roles',
      key: 'role_id'
    }
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  user_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'UserTypes',
      key: 'user_type_id'
    }
  }
}, {
  tableName: 'Users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Add validation hook for role_id
User.beforeValidate(async (user) => {
  if (user.role_id) {
    const Role = require('./roleModel');
    const role = await Role.findByPk(user.role_id);
    if (!role) {
      throw new Error('Invalid role');
    }
  }
  
  if (user.user_type_id) {
    const userType = await UserType.findByPk(user.user_type_id);
    if (!userType) {
      throw new Error('Invalid user type');
    }
  }
});

module.exports = User;