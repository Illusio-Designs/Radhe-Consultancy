const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync all models with alter option
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

module.exports = syncDatabase;