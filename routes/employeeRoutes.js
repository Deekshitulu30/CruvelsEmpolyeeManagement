const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
    getEmployees, getEmployeeById, getMyProfile,
    createEmployee, updateEmployee, updateEmployeeStatus,
    exportEmployeeData, deleteEmployee
} = require('../controllers/employeeController');

router.use(verifyToken);

router.get('/me', getMyProfile);

router.get('/',        authorizeRoles('ADMIN', 'MANAGER'), getEmployees);
router.get('/:id',     authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'), getEmployeeById);
router.get('/:id/export', authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'), exportEmployeeData);

router.post('/',            authorizeRoles('ADMIN'), createEmployee);
router.put('/:id',          authorizeRoles('ADMIN'), updateEmployee);
router.patch('/:id/status', authorizeRoles('ADMIN'), updateEmployeeStatus);
router.delete('/:id',       authorizeRoles('ADMIN'), deleteEmployee);

module.exports = router;
