const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 30000,
      evict: 1000,
    },
    retry: {
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/,
        /ECONNRESET/,
      ],
      max: 3,
    },
    dialectOptions: {
      connectTimeout: 60000,
    }
  }
);

// Test the connection with retry logic
const testConnection = async () => {
  let retries = 3;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      return;
    } catch (err) {
      console.error(`Unable to connect to the database (attempt ${4 - retries}/3):`, err);
      retries--;
      if (retries === 0) {
        console.error('Failed to connect to database after 3 attempts');
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

testConnection().catch(err => {
  console.error('Database connection failed:', err);
});

module.exports = sequelize; 