const express = require('express');
const router = express.Router();
const { getAllLeaveRequests, createLeaveRequest, updateLeaveStatus } = require('../controllers/leaveController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getAllLeaveRequests);
router.post('/', createLeaveRequest);
router.put('/:id/status', requireRole('SuperAdmin', 'HRAdmin'), updateLeaveStatus);

module.exports = router;
