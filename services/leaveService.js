const db = require('../config/db');
const { ValidationError, ForbiddenError, ConflictError, NotFoundError } = require('../utils/errors');
const { assertIsDirectReport } = require('./employeeService');

const VALID_LEAVE_TYPES = ['CASUAL', 'SICK', 'ANNUAL', 'UNPAID'];

function calculateWorkingDays(startDate, endDate) {
    let count = 0;
    const cur = new Date(startDate);
    const end = new Date(endDate);
    while (cur <= end) {
        const dayOfWeek = cur.getUTCDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return count;
}

async function createLeaveRequest({ employeeId, leave_type, start_date, end_date, reason }) {
    if (!VALID_LEAVE_TYPES.includes(leave_type?.toUpperCase())) {
        throw new ValidationError(`Invalid leave type. Must be one of: ${VALID_LEAVE_TYPES.join(', ')}`);
    }

    if (!reason?.trim()) {
        throw new ValidationError('Reason is required.');
    }

    const start = new Date(start_date);
    const end   = new Date(end_date);

    if (isNaN(start) || isNaN(end)) {
        throw new ValidationError('Invalid dates.');
    }

    if (end < start) {
        throw new ValidationError('End date cannot be before start date.');
    }

    const workingDays = calculateWorkingDays(start_date, end_date);
    if (workingDays === 0) {
        throw new ValidationError('Selected date range contains no working days (weekends only).');
    }

    const overlap = await db.query(
        `SELECT id FROM leave_requests
         WHERE employee_id = $1 AND status IN ('PENDING', 'APPROVED')
           AND NOT (end_date < $2 OR start_date > $3)`,
        [employeeId, start_date, end_date]
    );

    if (overlap.rows.length > 0) {
        throw new ConflictError('You already have a pending or approved leave that overlaps with the requested dates.');
    }

    const result = await db.query(
        `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [employeeId, leave_type.toUpperCase(), start_date, end_date, reason.trim()]
    );

    return {
        ...result.rows[0],
        days_count: workingDays
    };
}


async function getLeaveRequests({ role, employeeId, userId, empFilter, status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (role === 'EMPLOYEE') {
        conditions.push(`lr.employee_id = $${idx++}`);
        params.push(employeeId);
    } else if (role === 'MANAGER') {
        conditions.push(`e.manager_id = $${idx++}`);
        params.push(employeeId);
    }

    if (empFilter) {
        conditions.push(`lr.employee_id = $${idx++}`);
        params.push(empFilter);
    }

    if (status) {
        conditions.push(`lr.status = $${idx++}`);
        params.push(status.toUpperCase());
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(
        `SELECT COUNT(*) FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         ${where}`,
        params
    );

    const dataResult = await db.query(
        `SELECT lr.*, 
                e.first_name || ' ' || e.last_name AS employee_name,
                e.employee_code,
                ru.email AS reviewed_by_email
         FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         LEFT JOIN users ru ON lr.reviewed_by = ru.id
         ${where}
         ORDER BY lr.created_at DESC
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

async function getLeaveRequestById(id) {
    const result = await db.query(
        `SELECT lr.*,
                e.first_name || ' ' || e.last_name AS employee_name,
                e.employee_code, e.manager_id
         FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         WHERE lr.id = $1`,
        [id]
    );
    if (!result.rows[0]) throw new NotFoundError('Leave request');
    return result.rows[0];
}

async function reviewLeaveRequest(id, action, reviewerUserId, reviewerRole, reviewerEmployeeId) {
    const leave = await getLeaveRequestById(id);

    if (leave.status !== 'PENDING') {
        throw new ConflictError(`Leave request is already ${leave.status.toLowerCase()}.`);
    }

    if (reviewerRole === 'EMPLOYEE') {
        throw new ForbiddenError('Employees cannot review leave requests.');
    }

    if (reviewerRole === 'MANAGER') {
        await assertIsDirectReport(reviewerEmployeeId, leave.employee_id);
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    const result = await db.query(
        `UPDATE leave_requests
         SET status = $1, reviewed_by = $2, reviewed_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [newStatus, reviewerUserId, id]
    );

    return result.rows[0];
}

async function cancelLeaveRequest(id, employeeId, userRole) {
    const leave = await getLeaveRequestById(id);

    if (userRole === 'EMPLOYEE' && leave.employee_id !== employeeId) {
        throw new ForbiddenError('You can only cancel your own leave requests.');
    }

    if (leave.status !== 'PENDING') {
        throw new ConflictError(`Cannot cancel a leave request that is already ${leave.status.toLowerCase()}.`);
    }

    const result = await db.query(
        `UPDATE leave_requests SET status = 'CANCELLED' WHERE id = $1 RETURNING *`,
        [id]
    );

    return result.rows[0];
}

module.exports = { createLeaveRequest, getLeaveRequests, getLeaveRequestById, reviewLeaveRequest, cancelLeaveRequest, calculateWorkingDays };

