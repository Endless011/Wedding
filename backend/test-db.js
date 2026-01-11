require('dotenv').config();
const { Client } = require('pg');

console.log('Attempting to connect to:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        console.log('✅ Connected successfully to Render PostgreSQL!');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection error:', err);
        process.exit(1);
    });
