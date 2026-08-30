const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { checkIn, checkOut, getMyAttendance, getTeamAttendance } = require('../controllers/attendanceController');

router.use(verifyToken);

router.post('/check-in',  checkIn);
router.post('/check-out', checkOut);
router.get('/me',         getMyAttendance);
router.get('/team',       authorizeRoles('ADMIN', 'MANAGER'), getTeamAttendance);
router.get('/',           authorizeRoles('ADMIN'), getTeamAttendance);

module.exports = router;
