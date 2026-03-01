const express = require('express');
const router = express.Router();
const { getDb } = require('../models/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// POST /api/attendance
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const { date, time_in, time_out, status } = req.body;
        let { employee_id } = req.body;

        if (req.user.role === 'Employee') {
            employee_id = req.user.employee_id;
            if (!employee_id) return res.status(400).json({ success: false, message: 'No employee ID associated with this user.' });
        } else {
            if (!employee_id) return res.status(400).json({ success: false, message: 'employee_id is required.' });
        }

        if (!date) return res.status(400).json({ success: false, message: 'date is required.' });

        db.run(
            `INSERT INTO attendance (employee_id, date, time_in, time_out, status)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(employee_id, date) DO UPDATE SET
               time_in = COALESCE(?, time_in),
               time_out = COALESCE(?, time_out),
               status = COALESCE(?, status)`,
            [employee_id, date, time_in, time_out, status || 'Present', time_in, time_out, status],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({ success: true, message: 'Attendance recorded successfully.' });
            }
        );
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/attendance (HRAdmin/SuperAdmin only)
router.get('/', requireRole('HRAdmin', 'SuperAdmin'), (req, res) => {
    const db = getDb();
    db.all(`
        SELECT a.*, e.first_name, e.last_name 
        FROM attendance a 
        JOIN employees e ON a.employee_id = e.employee_id 
        ORDER BY a.date DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
});

module.exports = router;
