const leaveService = require('../services/leaveService');
const { logAudit } = require('../services/auditService');

const createLeave = async (req, res, next) => {
    try {
        if (!req.user.employeeId) {
            return res.status(400).json({ error: 'No employee profile linked to this account.' });
        }
        const leave = await leaveService.createLeaveRequest({
            employeeId: req.user.employeeId,
            ...req.body,
        });

        await logAudit({
            req,
            action: 'CREATE_LEAVE_REQUEST',
            entityType: 'LeaveRequest',
            entityId: leave.id,
            details: { leave_type: leave.leave_type, start_date: leave.start_date, end_date: leave.end_date }
        });

        res.status(201).json(leave);
    } catch (err) { next(err); }
};

const getMyLeaves = async (req, res, next) => {
    try {
        const { status, page, limit } = req.query;
        const result = await leaveService.getLeaveRequests({
            role: 'EMPLOYEE',
            employeeId: req.user.employeeId,
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });
        res.json(result);
    } catch (err) { next(err); }
};

const getAllLeaves = async (req, res, next) => {
    try {
        const { empFilter, status, page, limit } = req.query;
        const result = await leaveService.getLeaveRequests({
            role: req.user.role,
            employeeId: req.user.employeeId,
            userId: req.user.id,
            empFilter, status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });
        res.json(result);
    } catch (err) { next(err); }
};

const getLeaveById = async (req, res, next) => {
    try {
        const leave = await leaveService.getLeaveRequestById(req.params.id);

        if (req.user.role === 'EMPLOYEE' && leave.employee_id !== req.user.employeeId) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        res.json(leave);
    } catch (err) { next(err); }
};

const approveLeave = async (req, res, next) => {
    try {
        const leave = await leaveService.reviewLeaveRequest(
            req.params.id, 'approve',
            req.user.id, req.user.role, req.user.employeeId
        );

        await logAudit({
            req,
            action: 'APPROVE_LEAVE_REQUEST',
            entityType: 'LeaveRequest',
            entityId: leave.id,
            details: { employee_id: leave.employee_id, reviewer_role: req.user.role }
        });

        res.json(leave);
    } catch (err) { next(err); }
};

const rejectLeave = async (req, res, next) => {
    try {
        const leave = await leaveService.reviewLeaveRequest(
            req.params.id, 'reject',
            req.user.id, req.user.role, req.user.employeeId
        );

        await logAudit({
            req,
            action: 'REJECT_LEAVE_REQUEST',
            entityType: 'LeaveRequest',
            entityId: leave.id,
            details: { employee_id: leave.employee_id, reviewer_role: req.user.role }
        });

        res.json(leave);
    } catch (err) { next(err); }
};

const updateLeaveStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const action = status === 'APPROVED' ? 'approve' : 'reject';
        const leave = await leaveService.reviewLeaveRequest(
            req.params.id, action,
            req.user.id, req.user.role, req.user.employeeId
        );

        await logAudit({
            req,
            action: status === 'APPROVED' ? 'APPROVE_LEAVE_REQUEST' : 'REJECT_LEAVE_REQUEST',
            entityType: 'LeaveRequest',
            entityId: leave.id,
            details: { employee_id: leave.employee_id, reviewer_role: req.user.role }
        });

        res.json(leave);
    } catch (err) { next(err); }
};

const cancelLeave = async (req, res, next) => {
    try {
        const leave = await leaveService.cancelLeaveRequest(
            req.params.id,
            req.user.employeeId,
            req.user.role
        );

        await logAudit({
            req,
            action: 'CANCEL_LEAVE_REQUEST',
            entityType: 'LeaveRequest',
            entityId: leave.id,
            details: { employee_id: leave.employee_id, user_role: req.user.role }
        });

        res.json(leave);
    } catch (err) { next(err); }
};

module.exports = { createLeave, getMyLeaves, getAllLeaves, getLeaveById, approveLeave, rejectLeave, updateLeaveStatus, cancelLeave };

