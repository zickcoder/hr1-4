const express = require('express');
const router = express.Router();
const {
    createApplicant,
    getAllApplicants,
    getApplicant,
    updateApplicant,
    deleteApplicant,
    hireApplicant
} = require('../controllers/applicantController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All applicant routes require authentication
router.use(authenticateToken);

router.get('/', getAllApplicants);
router.get('/:id', getApplicant);
router.post('/', requireRole('SuperAdmin', 'HRAdmin'), createApplicant);
router.put('/:id', requireRole('SuperAdmin', 'HRAdmin'), updateApplicant);
router.delete('/:id', requireRole('SuperAdmin', 'HRAdmin'), deleteApplicant);
router.post('/:id/hire', requireRole('SuperAdmin', 'HRAdmin'), hireApplicant);

module.exports = router;
