const sequelize = require('../config/db');

async function updateRolePermissions() {
  try {
    // Update existing records where updated_at is NULL
    await sequelize.query(`
      UPDATE RolePermissions 
      SET updated_at = created_at 
      WHERE updated_at IS NULL;
    `);

    // Now alter the column to be NOT NULL
    await sequelize.query(`
      ALTER TABLE RolePermissions 
      MODIFY COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);

    console.log('Successfully updated RolePermissions table');
  } catch (error) {
    console.error('Error updating RolePermissions:', error);
  } finally {
    process.exit();
  }
}

updateRolePermissions(); 