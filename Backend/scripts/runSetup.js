require('dotenv').config();
const setupPermissions = require('./setupPermissions');

console.log('Starting permission setup...');
setupPermissions()
  .then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  }); 