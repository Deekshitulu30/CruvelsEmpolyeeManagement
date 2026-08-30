const db = require('../config/db');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

async function assertIsDirectReport(managerEmployeeId, targetEmployeeId) {
    const result = await db.query(
        'SELECT manager_id FROM employees WHERE id = $1 AND deleted_at IS NULL',
        [targetEmployeeId]
    );
    const target = result.rows[0];
    if (!target || target.manager_id !== managerEmployeeId) {
        throw new ForbiddenError('That employee is not your direct report.');
    }
}

async function getEmployees({ role, employeeId, search, department, status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = ['e.deleted_at IS NULL'];
    const params = [];
    let idx = 1;

    if (role === 'MANAGER') {
        conditions.push(`e.manager_id = $${idx++}`);
        params.push(employeeId);
    }

    if (search) {
        conditions.push(`(e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx} OR e.email ILIKE $${idx} OR e.employee_code ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
    }

    if (department) {
        conditions.push(`d.id = $${idx++}`);
        params.push(department);
    }

    if (status) {
        conditions.push(`e.status = $${idx++}`);
        params.push(status.toUpperCase());
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await db.query(
        `SELECT COUNT(*) FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         ${where}`,
        params
    );

    const dataResult = await db.query(
        `SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.phone,
                e.designation, e.joining_date, e.status, e.created_at,
                d.id AS department_id, d.name AS department_name,
                m.id AS manager_id,
                m.first_name || ' ' || m.last_name AS manager_name
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN employees m ON e.manager_id = m.id
         ${where}
         ORDER BY e.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
    );

    return {
        data: dataResult.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
    };
}

async function getEmployeeById(id) {
    const result = await db.query(
        `SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.phone,
                e.designation, e.joining_date, e.status, e.created_at, e.updated_at,
                e.user_id,
                d.id AS department_id, d.name AS department_name,
                m.id AS manager_id,
                m.first_name || ' ' || m.last_name AS manager_name,
                u.role
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN employees m ON e.manager_id = m.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE e.id = $1 AND e.deleted_at IS NULL`,
        [id]
    );
    if (!result.rows[0]) throw new NotFoundError('Employee');
    return result.rows[0];
}

async function createEmployee({ userData, employeeData }) {
    const bcrypt = require('bcryptjs');
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const passwordHash = await bcrypt.hash(employeeData.password || 'password123', 10);

        const userResult = await client.query(
            `INSERT INTO users (email, password_hash, role)
             VALUES ($1, $2, $3) RETURNING id`,
            [userData.email.toLowerCase().trim(), passwordHash, userData.role || 'EMPLOYEE']
        );

        const codeResult = await client.query(
            `SELECT employee_code FROM employees ORDER BY created_at DESC LIMIT 1`
        );
        let nextCode = 'EMP001';
        if (codeResult.rows[0]) {
            const last = parseInt(codeResult.rows[0].employee_code.replace('EMP', ''));
            nextCode = `EMP${String(last + 1).padStart(3, '0')}`;
        }

        const empResult = await client.query(
            `INSERT INTO employees (user_id, employee_code, first_name, last_name, email, phone,
                                    department_id, designation, joining_date, manager_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                userResult.rows[0].id, nextCode,
                employeeData.first_name, employeeData.last_name,
                userData.email.toLowerCase().trim(), employeeData.phone || null,
                employeeData.department_id || null, employeeData.designation || null,
                employeeData.joining_date || new Date().toISOString().split('T')[0],
                employeeData.manager_id || null,
            ]
        );

        await client.query('COMMIT');
        return empResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function updateEmployee(id, fields) {
    const allowed = ['first_name', 'last_name', 'phone', 'department_id', 'designation', 'joining_date', 'manager_id'];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const key of allowed) {
        if (fields[key] !== undefined) {
            updates.push(`${key} = $${idx++}`);
            params.push(fields[key]);
        }
    }

    if (updates.length === 0) throw new Error('No valid fields to update');

    params.push(id);
    const result = await db.query(
        `UPDATE employees SET ${updates.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
        params
    );
    if (!result.rows[0]) throw new NotFoundError('Employee');
    return result.rows[0];
}

async function updateEmployeeStatus(id, status) {
    const result = await db.query(
        `UPDATE employees SET status = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *`,
        [status.toUpperCase(), id]
    );
    if (!result.rows[0]) throw new NotFoundError('Employee');

    await db.query(
        `UPDATE users SET is_active = $1 WHERE id = (SELECT user_id FROM employees WHERE id = $2)`,
        [status.toUpperCase() === 'ACTIVE', id]
    );

    return result.rows[0];
}

/**
 * Soft Delete Strategy (GDPR / Right to be Forgotten)
 * Marks deleted_at on both employee profile and user auth records
 */
async function softDeleteEmployee(id) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const empRes = await client.query(
            `UPDATE employees SET deleted_at = NOW(), status = 'INACTIVE' WHERE id = $1 AND deleted_at IS NULL RETURNING user_id, first_name, last_name`,
            [id]
        );
        if (!empRes.rows[0]) throw new NotFoundError('Employee');

        await client.query(
            `UPDATE users SET deleted_at = NOW(), is_active = FALSE WHERE id = $1`,
            [empRes.rows[0].user_id]
        );
        await client.query('COMMIT');
        return empRes.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    assertIsDirectReport,
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    updateEmployeeStatus,
    softDeleteEmployee,
};
