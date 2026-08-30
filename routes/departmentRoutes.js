const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getDepartments, createDepartment } = require('../controllers/departmentController');

router.use(verifyToken);

router.get('/',  getDepartments);
router.post('/', authorizeRoles('ADMIN'), createDepartment);

module.exports = router;
