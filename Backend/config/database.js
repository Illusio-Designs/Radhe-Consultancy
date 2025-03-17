require('dotenv').config();
const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initial connection check
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database Connection Error:', err.message);
    } else {
        console.log('✅ Database connected successfully');
        connection.release();
    }
});

// Export the pool for use in other files
module.exports = pool.promise(); 