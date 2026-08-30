const attendanceService = require('../services/attendanceService');
const { logAudit } = require('../services/auditService');

const checkIn = async (req, res, next) => {
    try {
        if (!req.user.employeeId) {
            return res.status(400).json({ error: 'No employee profile linked to this account.' });
        }
        const record = await attendanceService.checkIn(req.user.employeeId);

        await logAudit({
            req,
            action: 'CHECK_IN',
            entityType: 'Attendance',
            entityId: record.id,
            details: { date: record.date, status: record.status }
        });

        res.status(201).json(record);
    } catch (err) { next(err); }
};

const checkOut = async (req, res, next) => {
    try {
        if (!req.user.employeeId) {
            return res.status(400).json({ error: 'No employee profile linked to this account.' });
        }
        const record = await attendanceService.checkOut(req.user.employeeId);

        await logAudit({
            req,
            action: 'CHECK_OUT',
            entityType: 'Attendance',
            entityId: record.id,
            details: { date: record.date }
        });

        res.json(record);
    } catch (err) { next(err); }
};

const getMyAttendance = async (req, res, next) => {
    try {
        const { startDate, endDate, page, limit } = req.query;
        const result = await attendanceService.getAttendance({
            role: 'EMPLOYEE',
            employeeId: req.user.employeeId,
            startDate, endDate,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 30,
        });
        res.json(result);
    } catch (err) { next(err); }
};

const getTeamAttendance = async (req, res, next) => {
    try {
        const { empFilter, startDate, endDate, page, limit } = req.query;
        const result = await attendanceService.getAttendance({
            role: req.user.role,
            employeeId: req.user.employeeId,
            empFilter, startDate, endDate,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 30,
        });
        res.json(result);
    } catch (err) { next(err); }
};

module.exports = { checkIn, checkOut, getMyAttendance, getTeamAttendance };
