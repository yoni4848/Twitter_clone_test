require('dotenv').config();
const { Pool } = require('pg');

console.log('Creating pool...');
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000
});

console.log('Attempting to connect...');
pool.connect((err, client, release) => {
    if (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
    console.log('Connected!');
    release();
    pool.end();
    process.exit(0);
});

setTimeout(() => {
    console.log('Timeout - connection took too long');
    process.exit(1);
}, 6000);
