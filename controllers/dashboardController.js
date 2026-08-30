const db = require('../config/db');

const getDashboard = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { role, employeeId, id: userId } = req.user;

        if (role === 'ADMIN') {
            const [empStats, deptBreakdown, todayAtt, pendingLeaves, recentLeaves, recentEmps] = await Promise.all([
                db.query(`SELECT COUNT(*) AS total,
                          COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active,
                          COUNT(*) FILTER (WHERE status = 'INACTIVE') AS inactive
                          FROM employees`),
                db.query(`SELECT d.name, COUNT(e.id) AS count
                          FROM departments d
                          LEFT JOIN employees e ON e.department_id = d.id
                          GROUP BY d.id, d.name ORDER BY count DESC`),
                db.query(`SELECT COUNT(*) FILTER (WHERE status = 'PRESENT' OR status = 'LATE') AS present,
                          COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent
                          FROM attendance WHERE date = $1`, [today]),
                db.query(`SELECT COUNT(*) AS count FROM leave_requests WHERE status = 'PENDING'`),
                db.query(`SELECT lr.*, e.first_name || ' ' || e.last_name AS employee_name
                          FROM leave_requests lr JOIN employees e ON lr.employee_id = e.id
                          ORDER BY lr.created_at DESC LIMIT 5`),
                db.query(`SELECT id, first_name, last_name, email, designation, status, created_at
                          FROM employees ORDER BY created_at DESC LIMIT 5`),
            ]);

            return res.json({
                role: 'ADMIN',
                stats: {
                    totalEmployees: parseInt(empStats.rows[0].total),
                    activeEmployees: parseInt(empStats.rows[0].active),
                    inactiveEmployees: parseInt(empStats.rows[0].inactive),
                    presentToday: parseInt(todayAtt.rows[0].present || 0),
                    absentToday: parseInt(todayAtt.rows[0].absent || 0),
                    pendingLeaves: parseInt(pendingLeaves.rows[0].count),
                },
                departmentBreakdown: deptBreakdown.rows,
                recentLeaveRequests: recentLeaves.rows,
                recentEmployees: recentEmps.rows,
            });
        }

        if (role === 'MANAGER') {
            const [teamSize, todayTeam, pendingTeam, teamMembers] = await Promise.all([
                db.query(`SELECT COUNT(*) AS total FROM employees WHERE manager_id = $1`, [employeeId]),
                db.query(`SELECT COUNT(*) FILTER (WHERE a.status = 'PRESENT' OR a.status = 'LATE') AS present,
                          COUNT(*) FILTER (WHERE a.status = 'ABSENT') AS absent,
                          COUNT(e.id) AS total
                          FROM employees e
                          LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = $1
                          WHERE e.manager_id = $2`, [today, employeeId]),
                db.query(`SELECT lr.*, e.first_name || ' ' || e.last_name AS employee_name
                          FROM leave_requests lr
                          JOIN employees e ON lr.employee_id = e.id
                          WHERE e.manager_id = $1 AND lr.status = 'PENDING'
                          ORDER BY lr.created_at DESC LIMIT 10`, [employeeId]),
                db.query(`SELECT e.id, e.first_name, e.last_name, e.designation, e.status,
                          a.status AS today_attendance, a.check_in, a.check_out
                          FROM employees e
                          LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = $1
                          WHERE e.manager_id = $2 ORDER BY e.first_name`, [today, employeeId]),
            ]);

            return res.json({
                role: 'MANAGER',
                stats: {
                    teamSize: parseInt(teamSize.rows[0].total),
                    presentToday: parseInt(todayTeam.rows[0].present || 0),
                    absentToday: parseInt(todayTeam.rows[0].absent || 0),
                    pendingLeaves: pendingTeam.rows.length,
                },
                pendingLeaveRequests: pendingTeam.rows,
                teamMembers: teamMembers.rows,
            });
        }

        // EMPLOYEE dashboard
        const [myAttSummary, myTodayAtt, myLeaves] = await Promise.all([
            db.query(`SELECT COUNT(*) FILTER (WHERE status = 'PRESENT') AS present,
                      COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent,
                      COUNT(*) FILTER (WHERE status = 'LATE') AS late,
                      COUNT(*) FILTER (WHERE status = 'HALF_DAY') AS half_day
                      FROM attendance WHERE employee_id = $1`, [employeeId]),
            db.query(`SELECT * FROM attendance WHERE employee_id = $1 AND date = $2`, [employeeId, today]),
            db.query(`SELECT COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
                      COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved,
                      COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected
                      FROM leave_requests WHERE employee_id = $1`, [employeeId]),
        ]);

        const recentLeaves = await db.query(
            `SELECT * FROM leave_requests WHERE employee_id = $1 ORDER BY created_at DESC LIMIT 5`,
            [employeeId]
        );

        res.json({
            role: 'EMPLOYEE',
            todayAttendance: myTodayAtt.rows[0] || null,
            attendanceSummary: myAttSummary.rows[0],
            leaveSummary: myLeaves.rows[0],
            recentLeaveRequests: recentLeaves.rows,
        });
    } catch (err) { next(err); }
};

module.exports = { getDashboard };
