const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

// Load .env file manually
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env file from:', envPath);

try {
  // Read file as UTF-16
  const envFile = fs.readFileSync(envPath, 'utf16le');
  console.log('Successfully read .env file');
  
  // Parse .env file manually
  const envConfig = {};
  envFile.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim() && !line.trim().startsWith('#')) {
      const [key, value] = line.split('=').map(part => part.trim());
      if (key && value) {
        // Remove any BOM or special characters
        const cleanKey = key.replace(/[\uFEFF\u200B]/g, '');
        const cleanValue = value.replace(/[\uFEFF\u200B]/g, '');
        envConfig[cleanKey] = cleanValue;
        process.env[cleanKey] = cleanValue;
      }
    }
  });

  console.log('Parsed environment variables:', envConfig);
} catch (error) {
  console.error('Error reading .env file:', error);
  throw new Error('Failed to read .env file');
}

// Debug: Log specific database variables
console.log('Database variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
  DB_DIALECT: process.env.DB_DIALECT
});

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
      connectTimeout: 60000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
    timezone: '+05:30',
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

testConnection();

module.exports = sequelize;