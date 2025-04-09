require('dotenv').config();
const sequelize = require('../config/db');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Test database name
    const [results] = await sequelize.query('SELECT DATABASE() as db');
    console.log('Connected to database:', results[0].db);
    
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

testConnection();
