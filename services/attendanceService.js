const db = require('../config/db');
const { ConflictError, ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

async function getAttendance({ role, employeeId, empFilter, startDate, endDate, page = 1, limit = 30 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (role === 'EMPLOYEE') {
        conditions.push(`a.employee_id = $${idx++}`);
        params.push(employeeId);
    } else if (role === 'MANAGER') {
        conditions.push(`e.manager_id = $${idx++}`);
        params.push(employeeId);
    }

    if (empFilter) {
        conditions.push(`a.employee_id = $${idx++}`);
        params.push(empFilter);
    }

    if (startDate) {
        conditions.push(`a.date >= $${idx++}`);
        params.push(startDate);
    }

    if (endDate) {
        conditions.push(`a.date <= $${idx++}`);
        params.push(endDate);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(
        `SELECT COUNT(*) FROM attendance a
         JOIN employees e ON a.employee_id = e.id
         ${where}`,
        params
    );

    const dataResult = await db.query(
        `SELECT a.id, a.employee_id, a.date, a.check_in, a.check_out, a.status, a.created_at,
                e.first_name || ' ' || e.last_name AS employee_name,
                e.employee_code
         FROM attendance a
         JOIN employees e ON a.employee_id = e.id
         ${where}
         ORDER BY a.date DESC, e.first_name
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

async function checkIn(employeeId) {
    const today = new Date().toISOString().split('T')[0];

    const existing = await db.query(
        'SELECT id, check_in, check_out FROM attendance WHERE employee_id = $1 AND date = $2',
        [employeeId, today]
    );

    if (existing.rows[0]) {
        if (existing.rows[0].check_in) {
            throw new ConflictError('You have already checked in today.');
        }
    }

    const now = new Date();
    const hour = now.getUTCHours();
    const status = hour >= 9 && hour < 10 ? 'PRESENT' : hour >= 10 ? 'LATE' : 'PRESENT';

    const result = await db.query(
        `INSERT INTO attendance (employee_id, date, check_in, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (employee_id, date) DO UPDATE SET check_in = $3, status = $4
         RETURNING *`,
        [employeeId, today, now, status]
    );

    return result.rows[0];
}

async function checkOut(employeeId) {
    const today = new Date().toISOString().split('T')[0];

    const existing = await db.query(
        'SELECT id, check_in, check_out, status FROM attendance WHERE employee_id = $1 AND date = $2',
        [employeeId, today]
    );

    if (!existing.rows[0] || !existing.rows[0].check_in) {
        throw new ValidationError('You must check in before checking out.');
    }

    if (existing.rows[0].check_out) {
        throw new ConflictError('You have already checked out today.');
    }

    const now = new Date();
    const checkInTime = new Date(existing.rows[0].check_in);
    const diffHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    let finalStatus = existing.rows[0].status;
    if (diffHours < 4) {
        finalStatus = 'HALF_DAY';
    }

    const result = await db.query(
        `UPDATE attendance SET check_out = $1, status = $2 WHERE employee_id = $3 AND date = $4 RETURNING *`,
        [now, finalStatus, employeeId, today]
    );

    return result.rows[0];
}


async function getTodaySummary(role, employeeId) {
    const today = new Date().toISOString().split('T')[0];

    if (role === 'EMPLOYEE') {
        const r = await db.query(
            'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
            [employeeId, today]
        );
        return r.rows[0] || null;
    }

    if (role === 'MANAGER') {
        const r = await db.query(
            `SELECT COUNT(*) FILTER (WHERE a.status = 'PRESENT') AS present,
                    COUNT(*) FILTER (WHERE a.status = 'ABSENT')  AS absent,
                    COUNT(*) FILTER (WHERE a.status = 'LATE')    AS late,
                    COUNT(e.id) AS total_team
             FROM employees e
             LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = $1
             WHERE e.manager_id = $2`,
            [today, employeeId]
        );
        return r.rows[0];
    }

    const r = await db.query(
        `SELECT COUNT(*) FILTER (WHERE status = 'PRESENT') AS present,
                COUNT(*) FILTER (WHERE status = 'ABSENT')  AS absent,
                COUNT(*) FILTER (WHERE status = 'LATE')    AS late
         FROM attendance WHERE date = $1`,
        [today]
    );
    return r.rows[0];
}

module.exports = { getAttendance, checkIn, checkOut, getTodaySummary };
