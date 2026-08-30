const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

async function getToken(email, password = 'password123') {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });
    return res.body.access_token;
}

async function getEmployeeId(email) {
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'password123' });
    return loginRes.body.user.employeeId;
}

describe('Leave Requests', () => {
    let employeeToken, managerToken, adminToken;
    let employeeId, vikramId;
    let createdLeaveId;

    beforeAll(async () => {
        employeeToken = await getToken('priya.singh@company.com');
        managerToken  = await getToken('manager@company.com');
        adminToken    = await getToken('admin@company.com');
        employeeId    = await getEmployeeId('priya.singh@company.com');
        vikramId      = await getEmployeeId('vikram.patel@company.com');
    });

    afterAll(async () => {
        if (createdLeaveId) {
            await db.query('DELETE FROM leave_requests WHERE id = $1', [createdLeaveId]);
        }
    });

    it('Test 13: Employee can create a leave request — returns 201 with PENDING status', async () => {
        const res = await request(app)
            .post('/api/leaves')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({
                leave_type: 'CASUAL',
                start_date: '2026-11-01',
                end_date:   '2026-11-02',
                reason:     'Personal work',
            });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('PENDING');
        expect(res.body.leave_type).toBe('CASUAL');
        createdLeaveId = res.body.id;
    });

    it('Test 14: Invalid date range (start > end) is rejected — returns 400', async () => {
        const res = await request(app)
            .post('/api/leaves')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({
                leave_type: 'SICK',
                start_date: '2026-11-10',
                end_date:   '2026-11-05',
                reason:     'Bad dates',
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('End date cannot be before start date');
    });

    it('Test 15: Employee cannot approve leave — returns 403', async () => {
        // Get a pending leave from seeded data
        const leavesRes = await request(app)
            .get('/api/leaves/me')
            .set('Authorization', `Bearer ${employeeToken}`);

        const pending = leavesRes.body.data.find(l => l.status === 'PENDING');

        if (!pending) return; // skip if no pending leave

        const res = await request(app)
            .patch(`/api/leaves/${pending.id}/approve`)
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(res.status).toBe(403);
    });

    it('Test 16: Manager can approve their direct report\'s leave — returns 200 with APPROVED', async () => {
        if (!createdLeaveId) {
            console.warn('Skipping: no leave created in Test 13');
            return;
        }

        const res = await request(app)
            .patch(`/api/leaves/${createdLeaveId}/approve`)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('APPROVED');
    });

    it('Test 17: Manager cannot approve leave of non-direct-report — returns 403', async () => {
        // ananya.gupta has no manager, so manager cannot approve her leaves
        const ananyaToken = await getToken('ananya.gupta@company.com');
        const ananyaId    = await getEmployeeId('ananya.gupta@company.com');

        // Create a leave for ananya
        const createRes = await request(app)
            .post('/api/leaves')
            .set('Authorization', `Bearer ${ananyaToken}`)
            .send({
                leave_type: 'CASUAL',
                start_date: '2026-12-01',
                end_date:   '2026-12-02',
                reason:     'Holiday',
            });

        expect(createRes.status).toBe(201);
        const leaveId = createRes.body.id;

        // Manager tries to approve ananya's leave (not a direct report)
        const approveRes = await request(app)
            .patch(`/api/leaves/${leaveId}/approve`)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(approveRes.status).toBe(403);

        // Cleanup
        await db.query('DELETE FROM leave_requests WHERE id = $1', [leaveId]);
    });

    it('Test 18: Cannot approve already-approved leave — returns 409', async () => {
        if (!createdLeaveId) return;

        const res = await request(app)
            .patch(`/api/leaves/${createdLeaveId}/approve`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/already approved/i);
    });
});
