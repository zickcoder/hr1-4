const express = require('express');
const router = express.Router();
const {
    getSummary,
    getHiringTrend,
    getAttendanceOverview,
    getPayrollTrend,
    getTrainingCompletion
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/summary', getSummary);
router.get('/hiring-trend', getHiringTrend);
router.get('/attendance-overview', getAttendanceOverview);
router.get('/payroll-trend', getPayrollTrend);
router.get('/training-completion', getTrainingCompletion);

module.exports = router;
