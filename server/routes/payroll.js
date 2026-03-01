const express = require('express');
const router = express.Router();
const { generatePayroll, getAllPayrolls, getEmployeePayrolls, updatePayrollStatus } = require('../controllers/payrollController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/generate', requireRole('SuperAdmin', 'HRAdmin'), generatePayroll);
router.get('/', requireRole('SuperAdmin', 'HRAdmin'), getAllPayrolls);
router.get('/:employee_id', getEmployeePayrolls);
router.put('/:id', requireRole('SuperAdmin', 'HRAdmin'), updatePayrollStatus);

module.exports = router;
