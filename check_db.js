require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function check() {
    try {
        const migrations = await pool.query(`
            SELECT id, name, applied_at
            FROM _migrations
            ORDER BY id
        `);

        const users = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('\n=== MIGRATIONS ===');
        console.table(migrations.rows);

        console.log('\n=== TABLES ===');
        console.table(users.rows);
    } catch (error) {
        console.error('Database error:', error.message);
    } finally {
        await pool.end();
    }
}

check();