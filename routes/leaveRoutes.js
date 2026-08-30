const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
    createLeave, getMyLeaves, getAllLeaves, getLeaveById,
    approveLeave, rejectLeave, updateLeaveStatus, cancelLeave
} = require('../controllers/leaveController');

router.use(verifyToken);


router.post('/',        createLeave);
router.get('/me',       getMyLeaves);
router.get('/',         authorizeRoles('ADMIN', 'MANAGER'), getAllLeaves);
router.get('/:id',      getLeaveById);

router.patch('/:id/approve', authorizeRoles('ADMIN', 'MANAGER'), approveLeave);
router.patch('/:id/reject',  authorizeRoles('ADMIN', 'MANAGER'), rejectLeave);
router.patch('/:id/status',  authorizeRoles('ADMIN', 'MANAGER'), updateLeaveStatus);
router.patch('/:id/cancel',  cancelLeave);

module.exports = router;


