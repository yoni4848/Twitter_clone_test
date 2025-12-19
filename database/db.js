// Import pg (PostgreSQL client)
const { Pool } = require('pg');

// Import dotenv to load .env file
require('dotenv').config();

// Create connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error connecting to database:', err.stack);
    }
    console.log('✅ Connected to PostgreSQL database!');
    release();
});

// Export pool to use in other files
module.exports = pool;

