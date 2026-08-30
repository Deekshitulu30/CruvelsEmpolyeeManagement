const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
    login,
    ssoLogin,
    signup,
    logout,
    logoutAllDevices,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
    get2FAStatus,
    setup2FA,
    verify2FA,
    disable2FA,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const authLimiter = process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
    });

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/sso-login', authLimiter, ssoLogin);
router.post('/logout', verifyToken, logout);
router.post('/logout-all', verifyToken, logoutAllDevices);
router.get('/me', verifyToken, getMe);

router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/change-password', verifyToken, changePassword);

// 2FA / TOTP Security endpoints
router.get('/2fa/status', verifyToken, get2FAStatus);
router.post('/2fa/setup', verifyToken, setup2FA);
router.post('/2fa/verify', verifyToken, verify2FA);
router.post('/2fa/disable', verifyToken, disable2FA);

module.exports = router;