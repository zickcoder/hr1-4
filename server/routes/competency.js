const express = require('express');
const router = express.Router();
const { createCompetency, getAllCompetencies, assignCompetency } = require('../controllers/competencyController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Create competency models
router.post('/', requireRole('SuperAdmin', 'HRAdmin'), createCompetency);
// Get competencies with employee assignments
router.get('/', getAllCompetencies);
// Assign/update employee competency level
router.post('/assign', requireRole('SuperAdmin', 'HRAdmin'), assignCompetency);

module.exports = router;
