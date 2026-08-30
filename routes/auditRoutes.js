const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { listAuditLogs } = require('../controllers/auditController');

router.use(verifyToken);
router.use(authorizeRoles('ADMIN'));

router.get('/', listAuditLogs);

module.exports = router;
