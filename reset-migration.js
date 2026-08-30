require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 5432,
});

async function reset() {
    const client = await pool.connect();

    try {
        console.log('Connected to:', process.env.DB_HOST);
        console.log('Database:', process.env.DB_NAME);
        console.log('User:', process.env.DB_USER);

        await client.query(`
            DELETE FROM _migrations
            WHERE name = '001_initial_schema.sql'
        `);

        const result = await client.query(`
            SELECT id, name
            FROM _migrations
            ORDER BY id
        `);

        console.log('\nRemaining migrations:');
        console.table(result.rows);

    } catch (error) {
        console.error('ERROR:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

reset();