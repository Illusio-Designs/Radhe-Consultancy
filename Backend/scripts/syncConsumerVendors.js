const sequelize = require('../config/db');
const { ConsumerVendor } = require('../models');

async function syncConsumerVendors() {
  try {
    // Sync the model with the database
    await sequelize.sync({ alter: true });

    // Update existing records with default values
    await ConsumerVendor.update(
      {
        email: 'default@example.com',
        name: 'Default User',
        dob: new Date(),
        gender: 'Not Specified',
        national_id: 'DEFAULT_ID',
        contact_address: 'Default Address'
      },
      {
        where: {
          email: null
        }
      }
    );

    console.log('Successfully synced ConsumerVendors table');
  } catch (error) {
    console.error('Error syncing ConsumerVendors:', error);
  } finally {
    process.exit();
  }
}

syncConsumerVendors(); 