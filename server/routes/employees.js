const express = require('express');
const router = express.Router();
const {
    createEmployee,
    getAllEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All employee routes require authentication
router.use(authenticateToken);

router.get('/', getAllEmployees);
router.get('/:id', getEmployee);
router.post('/', requireRole('SuperAdmin', 'HRAdmin'), createEmployee);
router.put('/:id', requireRole('SuperAdmin', 'HRAdmin'), updateEmployee);
router.delete('/:id', requireRole('SuperAdmin', 'HRAdmin'), deleteEmployee);

module.exports = router;
