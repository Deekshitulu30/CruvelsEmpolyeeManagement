const employeeService = require('../services/employeeService');
const { AppError } = require('../utils/errors');
const { logAudit } = require('../services/auditService');
const db = require('../config/db');

const getEmployees = async (req, res, next) => {
    try {
        const { search, department, status, page, limit } = req.query;
        const result = await employeeService.getEmployees({
            role: req.user.role,
            employeeId: req.user.employeeId,
            search, department, status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });
        res.json(result);
    } catch (err) { next(err); }
};

const getEmployeeById = async (req, res, next) => {
    try {
        const employee = await employeeService.getEmployeeById(req.params.id);

        // IDOR Authorization checks:
        if (req.user.role === 'EMPLOYEE' && employee.user_id !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to view this profile.' });
        }

        if (req.user.role === 'MANAGER') {
            const result = await db.query(
                'SELECT manager_id FROM employees WHERE id = $1 AND deleted_at IS NULL',
                [req.params.id]
            );
            if (!result.rows[0] || result.rows[0].manager_id !== req.user.employeeId) {
                return res.status(403).json({ error: 'That employee is not your direct report.' });
            }
        }

        res.json(employee);
    } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
    try {
        if (!req.user.employeeId) {
            return res.status(404).json({ error: 'No employee profile found.' });
        }
        const employee = await employeeService.getEmployeeById(req.user.employeeId);
        res.json(employee);
    } catch (err) { next(err); }
};

const createEmployee = async (req, res, next) => {
    try {
        const { email, role, password, ...employeeData } = req.body;

        if (!email || !employeeData.first_name || !employeeData.last_name) {
            return res.status(400).json({ error: 'Email, first_name, and last_name are required.' });
        }

        const employee = await employeeService.createEmployee({
            userData: { email, role: role || 'EMPLOYEE', password },
            employeeData: { ...employeeData, email },
        });

        await logAudit({
            req,
            action: 'CREATE_EMPLOYEE',
            entityType: 'Employee',
            entityId: employee.id,
            details: { name: `${employee.first_name} ${employee.last_name}`, email: employee.email }
        });

        res.status(201).json(employee);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already exists.' });
        }
        next(err);
    }
};

const updateEmployee = async (req, res, next) => {
    try {
        const employee = await employeeService.updateEmployee(req.params.id, req.body);

        await logAudit({
            req,
            action: 'UPDATE_EMPLOYEE',
            entityType: 'Employee',
            entityId: employee.id,
            details: { updatedFields: Object.keys(req.body) }
        });

        res.json(employee);
    } catch (err) { next(err); }
};

const updateEmployeeStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['ACTIVE', 'INACTIVE'].includes(status?.toUpperCase())) {
            return res.status(400).json({ error: 'Status must be ACTIVE or INACTIVE.' });
        }
        const employee = await employeeService.updateEmployeeStatus(req.params.id, status);

        await logAudit({
            req,
            action: 'UPDATE_EMPLOYEE_STATUS',
            entityType: 'Employee',
            entityId: employee.id,
            details: { newStatus: status.toUpperCase() }
        });

        res.json(employee);
    } catch (err) { next(err); }
};

/**
 * GDPR / CCPA Data Portability Export
 * Exports all user personal data, shift attendance, and leave requests as a single bundle.
 */
const exportEmployeeData = async (req, res, next) => {
    try {
        const employee = await employeeService.getEmployeeById(req.params.id);

        // IDOR Check: Users can only export their own data unless they are ADMIN
        if (req.user.role !== 'ADMIN' && employee.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: You may only export your own personal data.' });
        }

        const leaves = await db.query(
            'SELECT leave_type, start_date, end_date, reason, status, created_at FROM leave_requests WHERE employee_id = $1 ORDER BY created_at DESC',
            [employee.id]
        );

        const attendance = await db.query(
            'SELECT date, status, check_in, check_out, created_at FROM attendance WHERE employee_id = $1 ORDER BY date DESC',
            [employee.id]
        );

        await logAudit({
            req,
            action: 'GDPR_DATA_EXPORT',
            entityType: 'Employee',
            entityId: employee.id,
            details: { exportedBy: req.user.email }
        });

        res.json({
            export_timestamp: new Date().toISOString(),
            compliance: 'GDPR_ARTICLE_20_DATA_PORTABILITY',
            profile: employee,
            leave_history: leaves.rows,
            attendance_records: attendance.rows,
        });
    } catch (err) { next(err); }
};

/**
 * Soft Delete Employee
 */
const deleteEmployee = async (req, res, next) => {
    try {
        const result = await employeeService.softDeleteEmployee(req.params.id);

        await logAudit({
            req,
            action: 'DELETE_EMPLOYEE_SOFT',
            entityType: 'Employee',
            entityId: req.params.id,
            details: { name: `${result.first_name} ${result.last_name}` }
        });

        res.json({ message: 'Employee profile soft-deleted successfully (GDPR Right to be Forgotten applied).' });
    } catch (err) { next(err); }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    getMyProfile,
    createEmployee,
    updateEmployee,
    updateEmployeeStatus,
    exportEmployeeData,
    deleteEmployee,
};
