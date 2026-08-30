const { Pool } = require('pg');
require('dotenv').config();

async function createDb() {
    // Connect to the default 'postgres' database to create our target DB
    const pool = new Pool({
        user:     process.env.DB_USER,
        host:     process.env.DB_HOST,
        database: 'postgres',
        password: process.env.DB_PASSWORD,
        port:     parseInt(process.env.DB_PORT) || 5432,
    });

    const client = await pool.connect();
    try {
        const dbName = process.env.DB_NAME;
        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
        );

        if (result.rows.length > 0) {
            console.log(`✅ Database "${dbName}" already exists`);
        } else {
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Database "${dbName}" created`);
        }
    } finally {
        client.release();
        await pool.end();
    }
}

createDb().catch(err => {
    console.error('❌ Failed to create database:', err.message);
    process.exit(1);
});
