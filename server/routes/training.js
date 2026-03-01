const express = require('express');
const router = express.Router();
const { createTraining, getAllTraining, assignTraining, completeTraining, getEnrollments } = require('../controllers/trainingController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Create empty program
router.post('/', requireRole('SuperAdmin', 'HRAdmin'), createTraining);
// List programs and enrollments
router.get('/', getAllTraining);
router.get('/enrollments', getEnrollments);
// Assign employee to program
router.post('/assign', requireRole('SuperAdmin', 'HRAdmin'), assignTraining);
// Complete training
router.put('/:id/complete', requireRole('SuperAdmin', 'HRAdmin'), completeTraining);

module.exports = router;
