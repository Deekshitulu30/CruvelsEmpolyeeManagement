const request = require('supertest');
const app = require('../server');

async function getToken(email, password = 'password123') {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });
    return res.body.access_token;
}

describe('Audit Logs Endpoints', () => {
    it('Test 21: Admin can access GET /api/audit-logs and see logged events', async () => {
        const token = await getToken('admin@company.com');

        const res = await request(app)
            .get('/api/audit-logs')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('total');
    });

    it('Test 22: Non-admin (Employee) receives 403 Forbidden when requesting audit logs', async () => {
        const token = await getToken('arjun.sharma@company.com');

        const res = await request(app)
            .get('/api/audit-logs')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });
});
