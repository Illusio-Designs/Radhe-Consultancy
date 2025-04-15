const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

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
    defaultValue: 1, // Default to 'user' role
    references: {
      model: 'Roles',
      key: 'id'
    }
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Users',
  timestamps: false
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Hash password before updating if it's changed
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
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
});

// Add instance method for password validation
User.prototype.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = User;