require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const createTables = async () => {
    try {
        const client = await pool.connect();

        console.log('⏳ Creating tables...');

        // 1. Users Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        wedding_date TIMESTAMP,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 2. Groups Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 3. Categories Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        group_id VARCHAR(255) REFERENCES groups(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        target_quantity INTEGER DEFAULT 1,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 4. Products Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        category_id VARCHAR(255) REFERENCES categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(255),
        price DECIMAL(10, 2),
        purchased_quantity INTEGER DEFAULT 0,
        notes TEXT,
        is_purchased BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('✅ All tables created successfully!');
        client.release();
    } catch (err) {
        console.error('❌ Error creating tables:', err);
    } finally {
        pool.end();
    }
};

createTables();
