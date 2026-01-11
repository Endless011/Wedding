require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const updateSchema = async () => {
    try {
        const client = await pool.connect();
        console.log('⏳ Updating schema...');

        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS friend_code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS title VARCHAR(100) DEFAULT 'Gelin Hanım';
    `);

        console.log('✅ Schema updated successfully!');
        client.release();
    } catch (err) {
        console.error('❌ Error updating schema:', err);
    } finally {
        pool.end();
    }
};

updateSchema();
