const request = require('supertest');
const app = require('../server');

async function getToken(email, password = 'password123') {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });
    return res.body.access_token;
}

describe('Phase 4: Role-Based Access Control (RBAC) & Navigation Guards', () => {
    it('Employee receives 403 Forbidden when accessing Audit Logs (/api/audit-logs)', async () => {
        const employeeToken = await getToken('arjun.sharma@company.com');
        const res = await request(app)
            .get('/api/audit-logs')
            .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(403);
    });

    it('Employee receives 403 Forbidden when attempting to approve/reject leaves (/api/leaves/1/status)', async () => {
        const employeeToken = await getToken('arjun.sharma@company.com');
        const res = await request(app)
            .patch('/api/leaves/1/status')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({ status: 'APPROVED' });
        expect(res.status).toBe(403);
    });

    it('Employee receives 403 Forbidden when attempting org-wide attendance queries (/api/attendance)', async () => {
        const employeeToken = await getToken('arjun.sharma@company.com');
        const res = await request(app)
            .get('/api/attendance')
            .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(403);
    });

    it('Admin successfully accesses Audit Logs (/api/audit-logs)', async () => {
        const adminToken = await getToken('admin@company.com');
        const res = await request(app)
            .get('/api/audit-logs')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.logs || res.body.data || res.body)).toBe(true);
    });

    it('Unauthenticated requests are rejected with 401 Unauthorized', async () => {
        const res = await request(app).get('/api/audit-logs');
        expect(res.status).toBe(401);
    });
});
