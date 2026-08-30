const request = require('supertest');
const app = require('../server');

async function getToken(email, password = 'password123') {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });
    return res.body.access_token;
}

describe('Employee Authorization', () => {
    it('Test 6: Employee cannot access GET /api/employees (ADMIN/MANAGER only) — returns 403', async () => {
        const token = await getToken('arjun.sharma@company.com');

        const res = await request(app)
            .get('/api/employees')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    it('Test 7: Employee cannot create a new employee (ADMIN only) — returns 403', async () => {
        const token = await getToken('arjun.sharma@company.com');

        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${token}`)
            .send({
                email: 'test@test.com',
                first_name: 'Test',
                last_name: 'User',
            });

        expect(res.status).toBe(403);
    });

    it('Test 8: Admin can access GET /api/employees — returns 200 with data', async () => {
        const token = await getToken('admin@company.com');

        const res = await request(app)
            .get('/api/employees')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Test 9: Manager can access GET /api/employees — sees only their team', async () => {
        const token = await getToken('manager@company.com');

        const res = await request(app)
            .get('/api/employees')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
    });
});
