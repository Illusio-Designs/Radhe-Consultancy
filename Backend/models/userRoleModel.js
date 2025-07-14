const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserRole = sequelize.define('UserRole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Roles',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  }
}, {
  tableName: 'UserRoles',
  timestamps: false,
  modelName: 'UserRole'
});

module.exports = UserRole; 