const { sequelize } = require('../config/db');
const initDatabase = require('./dbInitSync');

async function initialize() {
  try {
    console.log('Starting database initialization...');
    await initDatabase();
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initialize(); 