const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

describe('Auth Endpoints', () => {
    it('Test 1: Valid login returns 200 and access_token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@company.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.role).toBe('ADMIN');
    });

    it('Test 2: Invalid password returns 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@company.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe('Invalid credentials.');
    });

    it('Test 3: Non-existent email returns 401 (generic message — no email enumeration)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: 'password123' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid credentials.');
    });

    it('Test 4: Unauthenticated request to /api/employees returns 401', async () => {
        const res = await request(app).get('/api/employees');

        expect(res.status).toBe(401);
    });

    it('Test 5: Valid /api/auth/me returns user data', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@company.com', password: 'password123' });

        const token = loginRes.body.access_token;

        const meRes = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(meRes.status).toBe(200);
        expect(meRes.body.email).toBe('admin@company.com');
        expect(meRes.body.role).toBe('ADMIN');
        expect(meRes.body).not.toHaveProperty('password_hash');
    });

    it('Test 19: Forgot password generates token and returns 200', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'arjun.sharma@company.com' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('reset_token');
        expect(res.body).toHaveProperty('reset_url');
    });

    it('Test 20: Reset password updates password and allows login with new password', async () => {
        const forgotRes = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'priya.singh@company.com' });

        const token = forgotRes.body.reset_token;

        const resetRes = await request(app)
            .post('/api/auth/reset-password')
            .send({ token, new_password: 'newpassword456' });

        expect(resetRes.status).toBe(200);
        expect(resetRes.body.message).toContain('reset successfully');

        // Test login with new password
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'priya.singh@company.com', password: 'newpassword456' });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toHaveProperty('access_token');

        // Restore original password for test consistency
        await request(app)
            .post('/api/auth/change-password')
            .set('Authorization', `Bearer ${loginRes.body.access_token}`)
            .send({ current_password: 'newpassword456', new_password: 'password123' });
    });

    it('Test 21: Request size limit rejects payload > 10KB with 413', async () => {
        const hugeString = 'A'.repeat(15 * 1024); // 15KB string
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@company.com', password: hugeString });

        expect(res.status).toBe(413);
        expect(res.body.error).toContain('Payload too large');
    });

    it('Test 22: Account lock after 5 consecutive failed login attempts', async () => {
        const testEmail = 'ananya.gupta@company.com';

        // Reset any prior failed attempts for this test user
        await db.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1', [testEmail]);

        // Attempt 4 failed logins
        for (let i = 0; i < 4; i++) {
            const failRes = await request(app)
                .post('/api/auth/login')
                .send({ email: testEmail, password: 'wrongpassword' });
            expect(failRes.status).toBe(401);
        }

        // 5th failed login must lock account with 423
        const lockRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'wrongpassword' });

        expect(lockRes.status).toBe(423);
        expect(lockRes.body.error).toContain('Account locked for 15 minutes');

        // Subsequent attempt with right password also gets 423 until lock expires or password is reset
        const lockedAttempt = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'password123' });

        expect(lockedAttempt.status).toBe(423);

        // Cleanup: Unlock the test user
        await db.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1', [testEmail]);
    });

    it('Test 23: POST /api/auth/logout-all invalidates previous session tokens', async () => {
        // 1. Login to get an active token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@company.com', password: 'password123' });

        const oldToken = loginRes.body.access_token;

        // Verify old token works
        const check1 = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${oldToken}`);
        expect(check1.status).toBe(200);

        // 2. Call logout-all
        const logoutAllRes = await request(app)
            .post('/api/auth/logout-all')
            .set('Authorization', `Bearer ${oldToken}`);
        expect(logoutAllRes.status).toBe(200);

        // 3. Old token should now be rejected with 401
        const check2 = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${oldToken}`);
        expect(check2.status).toBe(401);
        expect(check2.body.error).toContain('Session invalidated');
    });

    it('Test 24: Security headers include CSP and HSTS', async () => {
        const res = await request(app).get('/api/health');

        expect(res.headers).toHaveProperty('content-security-policy');
        expect(res.headers['content-security-policy']).toContain("default-src 'self'");
        expect(res.headers).toHaveProperty('strict-transport-security');
        expect(res.headers['x-frame-options']).toBe('DENY');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('Test 25: New login with single-session invalidates previous session tokens', async () => {
        const login1 = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@company.com', password: 'password123' });
        const token1 = login1.body.access_token;

        const login2 = await request(app)
            .post('/api/auth/login')
            .set('x-single-session', 'true')
            .send({ email: 'admin@company.com', password: 'password123' });
        const token2 = login2.body.access_token;

        const checkOld = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token1}`);
        expect(checkOld.status).toBe(401);
        expect(checkOld.body.code).toBe('CONCURRENT_LOGIN_LOGOUT');

        const checkNew = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token2}`);
        expect(checkNew.status).toBe(200);
    });
});
