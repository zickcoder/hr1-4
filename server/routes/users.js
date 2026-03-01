const express = require('express');
const router = express.Router();
const { createEmployeeAccount } = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('SuperAdmin', 'HRAdmin'));

router.post('/create-employee-account', createEmployeeAccount);

module.exports = router;
