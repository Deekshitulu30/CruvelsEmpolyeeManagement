const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

async function getToken(email, password = 'password123') {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });
    return res.body.access_token;
}

describe('Phase 5: Real Attendance & Leave Workflows', () => {
    let employeeToken;
    let employeeId;
    let createdLeaveId;

    beforeAll(async () => {
        employeeToken = await getToken('arjun.sharma@company.com');
        const meRes = await request(app)
            .get('/api/employees/me')
            .set('Authorization', `Bearer ${employeeToken}`);
        employeeId = meRes.body.id;

        const today = new Date().toISOString().split('T')[0];
        await db.query('DELETE FROM attendance WHERE employee_id = $1 AND date = $2', [employeeId, today]);
    });

    afterAll(async () => {
        if (createdLeaveId) {
            await db.query('DELETE FROM leave_requests WHERE id = $1', [createdLeaveId]);
        }
    });

    it('Attendance: Employee checks in successfully with initial status', async () => {
        const res = await request(app)
            .post('/api/attendance/check-in')
            .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('check_in');
        expect(['PRESENT', 'LATE']).toContain(res.body.status);
    });

    it('Attendance: Duplicate check-in is rejected with 409 Conflict', async () => {
        const res = await request(app)
            .post('/api/attendance/check-in')
            .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/already checked in/i);
    });

    it('Attendance: Check-out updates record and computes shift completion status', async () => {
        const res = await request(app)
            .post('/api/attendance/check-out')
            .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('check_out');
        expect(['PRESENT', 'LATE', 'HALF_DAY']).toContain(res.body.status);
    });

    it('Attendance: Duplicate check-out is rejected with 409 Conflict', async () => {
        const res = await request(app)
            .post('/api/attendance/check-out')
            .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/already checked out/i);
    });

    it('Leaves: Weekend-only leave range is rejected as having no working days', async () => {
        const res = await request(app)
            .post('/api/leaves')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({
                leave_type: 'CASUAL',
                start_date: '2026-11-07',
                end_date:   '2026-11-08',
                reason:     'Weekend trip'
            });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/no working days/i);
    });

    it('Leaves: Valid leave creation calculates working days', async () => {
        const res = await request(app)
            .post('/api/leaves')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({
                leave_type: 'CASUAL',
                start_date: '2026-11-09',
                end_date:   '2026-11-11',
                reason:     'Midweek personal work'
            });
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('PENDING');
        expect(res.body.days_count).toBe(3);
        createdLeaveId = res.body.id;
    });

    it('Leaves: Overlapping leave range for same employee is rejected with 409 Conflict', async () => {
        const res = await request(app)
            .post('/api/leaves')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({
                leave_type: 'SICK',
                start_date: '2026-11-10',
                end_date:   '2026-11-12',
                reason:     'Overlapping flu'
            });
        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/overlaps with the requested dates/i);
    });

    it('Leaves: Employee can cancel their own PENDING leave request', async () => {
        const res = await request(app)
            .patch(`/api/leaves/${createdLeaveId}/cancel`)
            .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('CANCELLED');
    });

    it('Leaves: Cannot cancel already cancelled leave request', async () => {
        const res = await request(app)
            .patch(`/api/leaves/${createdLeaveId}/cancel`)
            .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(409);
    });
});
