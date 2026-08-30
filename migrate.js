const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user:     process.env.DB_USER,
    host:     process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port:     parseInt(process.env.DB_PORT) || 5432,
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

        for (const file of files) {
            const applied = await client.query('SELECT 1 FROM _migrations WHERE name = $1', [file]);
            if (applied.rows.length > 0) {
                console.log(`⏩ ${file} already applied, skipping.`);
                continue;
            }

            console.log(`Running migration: ${file}...`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await client.query(sql);
            await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
            console.log(`✅ ${file} applied successfully!`);
        }
        console.log('🎉 All migrations up to date!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
