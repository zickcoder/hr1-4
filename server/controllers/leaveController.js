const { getDb } = require('../models/db');

// GET /api/leave
const getAllLeaveRequests = (req, res) => {
    const db = getDb();
    db.all(`
        SELECT l.*, e.first_name, e.last_name, e.department
        FROM leave_requests l
        JOIN employees e ON l.employee_id = e.employee_id
        ORDER BY l.created_at DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
};

// POST /api/leave
const createLeaveRequest = (req, res) => {
    const { employee_id, type, start_date, end_date, reason } = req.body;

    if (!employee_id || !type || !start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const db = getDb();
    db.run(
        `INSERT INTO leave_requests (employee_id, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)`,
        [employee_id, type, start_date, end_date, reason],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.status(201).json({ success: true, message: 'Leave request submitted.', id: this.lastID });
        }
    );
};

// PUT /api/leave/:id/status
const updateLeaveStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const db = getDb();
    db.run(
        `UPDATE leave_requests SET status = ? WHERE id = ?`,
        [status, id],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: `Leave request ${status.toLowerCase()}.` });
        }
    );
};

module.exports = { getAllLeaveRequests, createLeaveRequest, updateLeaveStatus };
