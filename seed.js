const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

// ─── Database Connection ─────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10) || 5432,

    // Supabase + Render SSL configuration
    ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,
});

// ─── Configuration ────────────────────────────────────────────────────────────

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

// ─── Seed Database ────────────────────────────────────────────────────────────

async function seed() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('🌱 Seeding database...');

        // ─── Hash Password ────────────────────────────────────────────────────

        const passwordHash = await bcrypt.hash(
            DEFAULT_PASSWORD,
            SALT_ROUNDS
        );

        // ─── Departments ──────────────────────────────────────────────────────

        const deptResult = await client.query(`
            INSERT INTO departments (name) VALUES
                ('Engineering'),
                ('Human Resources'),
                ('Sales'),
                ('Finance'),
                ('Marketing')
            ON CONFLICT (name)
            DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `);

        const depts = {};

        deptResult.rows.forEach((department) => {
            depts[department.name] = department.id;
        });

        console.log(
            '✅ Departments seeded:',
            Object.keys(depts).join(', ')
        );

        // ─── Users ───────────────────────────────────────────────────────────

        const adminUser = await client.query(`
            INSERT INTO users (
                email,
                password_hash,
                role
            )
            VALUES (
                'admin@company.com',
                $1,
                'ADMIN'
            )
            ON CONFLICT (email)
            DO UPDATE SET password_hash = $1
            RETURNING id
        `, [passwordHash]);

        const managerUser = await client.query(`
            INSERT INTO users (
                email,
                password_hash,
                role
            )
            VALUES (
                'manager@company.com',
                $1,
                'MANAGER'
            )
            ON CONFLICT (email)
            DO UPDATE SET password_hash = $1
            RETURNING id
        `, [passwordHash]);

        const emp1User = await client.query(`
            INSERT INTO users (
                email,
                password_hash,
                role
            )
            VALUES (
                'arjun.sharma@company.com',
                $1,
                'EMPLOYEE'
            )
            ON CONFLICT (email)
            DO UPDATE SET password_hash = $1
            RETURNING id
        `, [passwordHash]);

        const emp2User = await client.query(`
            INSERT INTO users (
                email,
                password_hash,
                role
            )
            VALUES (
                'priya.singh@company.com',
                $1,
                'EMPLOYEE'
            )
            ON CONFLICT (email)
            DO UPDATE SET password_hash = $1
            RETURNING id
        `, [passwordHash]);

        const emp3User = await client.query(`
            INSERT INTO users (
                email,
                password_hash,
                role
            )
            VALUES (
                'vikram.patel@company.com',
                $1,
                'EMPLOYEE'
            )
            ON CONFLICT (email)
            DO UPDATE SET password_hash = $1
            RETURNING id
        `, [passwordHash]);

        const emp4User = await client.query(`
            INSERT INTO users (
                email,
                password_hash,
                role
            )
            VALUES (
                'ananya.gupta@company.com',
                $1,
                'EMPLOYEE'
            )
            ON CONFLICT (email)
            DO UPDATE SET password_hash = $1
            RETURNING id
        `, [passwordHash]);

        console.log('✅ Users seeded');

        // ─── Admin Employee Record ────────────────────────────────────────────

        const adminEmpResult = await client.query(`
            INSERT INTO employees (
                user_id,
                employee_code,
                first_name,
                last_name,
                email,
                department_id,
                designation,
                joining_date
            )
            VALUES (
                $1,
                'EMP001',
                'Admin',
                'User',
                'admin@company.com',
                $2,
                'HR Administrator',
                '2023-01-01'
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                employee_code = EXCLUDED.employee_code
            RETURNING id
        `, [
            adminUser.rows[0].id,
            depts['Human Resources'],
        ]);

        // ─── Manager Employee Record ─────────────────────────────────────────

        const managerEmpResult = await client.query(`
            INSERT INTO employees (
                user_id,
                employee_code,
                first_name,
                last_name,
                email,
                phone,
                department_id,
                designation,
                joining_date
            )
            VALUES (
                $1,
                'EMP002',
                'Rahul',
                'Verma',
                'manager@company.com',
                '9876543210',
                $2,
                'Engineering Manager',
                '2023-03-15'
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                employee_code = EXCLUDED.employee_code
            RETURNING id
        `, [
            managerUser.rows[0].id,
            depts['Engineering'],
        ]);

        const managerId = managerEmpResult.rows[0].id;

        // ─── Employee Records ────────────────────────────────────────────────

        const arjunResult = await client.query(`
            INSERT INTO employees (
                user_id,
                employee_code,
                first_name,
                last_name,
                email,
                phone,
                department_id,
                designation,
                joining_date,
                manager_id
            )
            VALUES (
                $1,
                'EMP003',
                'Arjun',
                'Sharma',
                'arjun.sharma@company.com',
                '9123456780',
                $2,
                'Software Engineer',
                '2024-01-10',
                $3
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                employee_code = EXCLUDED.employee_code
            RETURNING id
        `, [
            emp1User.rows[0].id,
            depts['Engineering'],
            managerId,
        ]);

        const priyaResult = await client.query(`
            INSERT INTO employees (
                user_id,
                employee_code,
                first_name,
                last_name,
                email,
                phone,
                department_id,
                designation,
                joining_date,
                manager_id
            )
            VALUES (
                $1,
                'EMP004',
                'Priya',
                'Singh',
                'priya.singh@company.com',
                '9234567890',
                $2,
                'Frontend Developer',
                '2024-02-20',
                $3
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                employee_code = EXCLUDED.employee_code
            RETURNING id
        `, [
            emp2User.rows[0].id,
            depts['Engineering'],
            managerId,
        ]);

        const vikramResult = await client.query(`
            INSERT INTO employees (
                user_id,
                employee_code,
                first_name,
                last_name,
                email,
                phone,
                department_id,
                designation,
                joining_date,
                manager_id
            )
            VALUES (
                $1,
                'EMP005',
                'Vikram',
                'Patel',
                'vikram.patel@company.com',
                '9345678901',
                $2,
                'Backend Developer',
                '2024-03-05',
                $3
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                employee_code = EXCLUDED.employee_code
            RETURNING id
        `, [
            emp3User.rows[0].id,
            depts['Engineering'],
            managerId,
        ]);

        const ananyaResult = await client.query(`
            INSERT INTO employees (
                user_id,
                employee_code,
                first_name,
                last_name,
                email,
                phone,
                department_id,
                designation,
                joining_date
            )
            VALUES (
                $1,
                'EMP006',
                'Ananya',
                'Gupta',
                'ananya.gupta@company.com',
                '9456789012',
                $2,
                'HR Executive',
                '2024-04-15'
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                employee_code = EXCLUDED.employee_code
            RETURNING id
        `, [
            emp4User.rows[0].id,
            depts['Human Resources'],
        ]);

        console.log('✅ Employees seeded');

        // ─── Employee IDs ────────────────────────────────────────────────────

        const empIds = {
            arjun: arjunResult.rows[0].id,
            priya: priyaResult.rows[0].id,
            vikram: vikramResult.rows[0].id,
            ananya: ananyaResult.rows[0].id,
            manager: managerId,
        };

        // ─── Sample Attendance ───────────────────────────────────────────────

        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);

            date.setDate(today.getDate() - i);

            const dateStr = date
                .toISOString()
                .split('T')[0];

            const isWeekend =
                date.getDay() === 0 ||
                date.getDay() === 6;

            if (isWeekend) {
                continue;
            }

            const checkIn =
                new Date(`${dateStr}T09:00:00Z`);

            const checkOut =
                new Date(`${dateStr}T18:00:00Z`);

            for (const [name, empId] of Object.entries(empIds)) {
                const absent =
                    name === 'ananya' && i === 3;

                await client.query(`
                    INSERT INTO attendance (
                        employee_id,
                        date,
                        check_in,
                        check_out,
                        status
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )
                    ON CONFLICT (
                        employee_id,
                        date
                    )
                    DO NOTHING
                `, [
                    empId,
                    dateStr,
                    absent ? null : checkIn,
                    absent ? null : checkOut,
                    absent ? 'ABSENT' : 'PRESENT',
                ]);
            }
        }

        console.log('✅ Attendance seeded');

        // ─── Sample Leave Requests ───────────────────────────────────────────

        await client.query(`
            INSERT INTO leave_requests (
                employee_id,
                leave_type,
                start_date,
                end_date,
                reason,
                status,
                reviewed_by,
                reviewed_at
            )
            VALUES
                (
                    $1,
                    'SICK',
                    '2026-08-10',
                    '2026-08-11',
                    'Fever and cold',
                    'APPROVED',
                    $5,
                    NOW() - interval '5 days'
                ),
                (
                    $2,
                    'CASUAL',
                    '2026-09-05',
                    '2026-09-06',
                    'Family function',
                    'PENDING',
                    NULL,
                    NULL
                ),
                (
                    $3,
                    'ANNUAL',
                    '2026-09-15',
                    '2026-09-20',
                    'Vacation trip',
                    'PENDING',
                    NULL,
                    NULL
                ),
                (
                    $4,
                    'CASUAL',
                    '2026-08-20',
                    '2026-08-20',
                    'Personal errands',
                    'REJECTED',
                    $5,
                    NOW() - interval '3 days'
                )
            ON CONFLICT DO NOTHING
        `, [
            empIds.arjun,
            empIds.priya,
            empIds.vikram,
            empIds.ananya,
            adminUser.rows[0].id,
        ]);

        console.log('✅ Leave requests seeded');

        // ─── Commit ──────────────────────────────────────────────────────────

        await client.query('COMMIT');

        console.log('\n🎉 Seeding complete!\n');

        console.log(
            'Demo Credentials (password: password123):'
        );

        console.log(
            '  admin@company.com → ADMIN'
        );

        console.log(
            '  manager@company.com → MANAGER'
        );

        console.log(
            '  arjun.sharma@company.com → EMPLOYEE (reports to manager)'
        );

        console.log(
            '  priya.singh@company.com → EMPLOYEE (reports to manager)'
        );

        console.log(
            '  vikram.patel@company.com → EMPLOYEE (reports to manager)'
        );

        console.log(
            '  ananya.gupta@company.com → EMPLOYEE (HR dept, no manager)'
        );

    } catch (err) {
        await client.query('ROLLBACK');

        console.error(
            '❌ Seed failed:',
            err.message
        );

        throw err;

    } finally {
        client.release();
        await pool.end();
    }
}

// ─── Run Seed ─────────────────────────────────────────────────────────────────

seed().catch(() => {
    process.exit(1);
});