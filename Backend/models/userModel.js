const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const Role = require('./roleModel');

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
  contact_number: {
    type: DataTypes.STRING(20),
    allowNull: true
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
    defaultValue: 1,
    references: {
      model: 'Roles',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION'
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Users',
  underscored: true
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    try {
      console.log('Hashing password for new user:', user.email);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      console.log('Password hashed successfully');
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }
});

// Hash password before updating if it's changed
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    try {
      console.log('Hashing updated password for user:', user.email);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      console.log('Updated password hashed successfully');
    } catch (error) {
      console.error('Error hashing updated password:', error);
      throw error;
    }
  }
});

// Add validation hook for role_id
User.beforeValidate(async (user) => {
  if (user.role_id) {
    const role = await Role.findByPk(user.role_id);
    if (!role) {
      throw new Error('Invalid role');
    }
  }
});

// Add instance method for password validation
User.prototype.validatePassword = async function(password) {
  try {
    console.log('Validating password for user:', this.email);
    console.log('Provided password:', password);
    console.log('Stored password hash:', this.password);
    
    if (!this.password) {
      console.log('No password hash found for user');
      return false;
    }
    
    if (!password) {
      console.log('No password provided for validation');
      return false;
    }
    
    const isValid = await bcrypt.compare(password, this.password);
    console.log('Password validation result:', isValid);
    
    // If validation fails, try to hash the provided password and compare hashes
    if (!isValid) {
      console.log('Password validation failed, checking hash generation...');
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      console.log('New hash generated:', newHash);
      console.log('Hash comparison:', newHash === this.password);
    }
    
    return isValid;
  } catch (error) {
    console.error('Error validating password:', error);
    return false;
  }
};

module.exports = User;