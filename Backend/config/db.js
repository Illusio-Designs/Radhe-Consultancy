const { Sequelize } = require('sequelize');
require('dotenv').config();

// Get database configuration from environment variables
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'radhe_consultancy_crm';
const DB_PORT = process.env.DB_PORT || 3306;

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // This allows zeros in date fields, which can help with the '0000-00-00' issue
    dateStrings: true,
    typeCast: true,
  },
  define: {
    // Global model options
    timestamps: true, // Default to include timestamps
    underscored: true, // Use snake_case for auto-generated fields
    freezeTableName: false, // Don't pluralize table names
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  },
  timezone: '+05:30' // Adjust to your timezone
});

module.exports = sequelize;