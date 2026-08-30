const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

async function getToken(email, password = 'password123') {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });
    return res.body.access_token;
}

async function clearTodayAttendance(employeeId) {
    const today = new Date().toISOString().split('T')[0];
    await db.query('DELETE FROM attendance WHERE employee_id = $1 AND date = $2', [employeeId, today]);
}

describe('Attendance', () => {
    let employeeToken;
    let employeeId;

    beforeAll(async () => {
        employeeToken = await getToken('arjun.sharma@company.com');
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'arjun.sharma@company.com', password: 'password123' });
        employeeId = loginRes.body.user.employeeId;
    });

    beforeEach(async () => {
        await clearTodayAttendance(employeeId);
    });

    afterAll(async () => {
        await clearTodayAttendance(employeeId);
    });

    it('Test 10: Employee can check in — returns 201 with attendance record', async () => {
        const res = await request(app)
            .post('/api/attendance/check-in')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('check_in');
        expect(res.body.employee_id).toBe(employeeId);
    });

    it('Test 11: Employee cannot check in twice on same day — returns 409', async () => {
        // First check-in
        await request(app)
            .post('/api/attendance/check-in')
            .set('Authorization', `Bearer ${employeeToken}`);

        // Second check-in attempt
        const res = await request(app)
            .post('/api/attendance/check-in')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(res.status).toBe(409);
        expect(res.body.error).toContain('already checked in');
    });

    it('Test 12: Employee can view their own attendance history', async () => {
        const res = await request(app)
            .get('/api/attendance/me')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
