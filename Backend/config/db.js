const { Sequelize } = require('sequelize');

// Database configuration
const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = '';
const DB_NAME = 'radhe_consultancy_crm';
const DB_PORT = 3306;
const DB_DIALECT = 'mysql';

console.log('\n=== Database Configuration ===');
console.log('Host:', DB_HOST);
console.log('Database:', DB_NAME);
console.log('User:', DB_USER);
console.log('Port:', DB_PORT);
console.log('Dialect:', DB_DIALECT);
console.log('============================\n');

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: console.log, // Enable SQL query logging
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

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Test connection on startup
testConnection();

module.exports = sequelize;