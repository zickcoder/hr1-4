const express = require('express');
const router = express.Router();
const { createOrUpdateSalary, getSalary, getAllSalaries } = require('../controllers/salaryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// List all active employees with their salary setup
router.get('/', requireRole('SuperAdmin', 'HRAdmin'), getAllSalaries);

// Get single employee salary config
router.get('/:employee_id', requireRole('SuperAdmin', 'HRAdmin'), getSalary);

// Create or update salary config
router.post('/', requireRole('SuperAdmin', 'HRAdmin'), createOrUpdateSalary);

module.exports = router;
