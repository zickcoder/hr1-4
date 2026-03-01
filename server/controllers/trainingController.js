const { getDb } = require('../models/db');

// POST /api/training
const createTraining = (req, res) => {
    const { title, description, type } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    const db = getDb();
    db.run(
        'INSERT INTO training_programs (title, description, type) VALUES (?, ?, ?)',
        [title, description, type || 'Optional'],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.status(201).json({ success: true, message: 'Training program created.', id: this.lastID });
        }
    );
};

// GET /api/training
// Returns all programs AND the employees enrolled in each (requires separate queries or left joins)
const getAllTraining = (req, res) => {
    const db = getDb();

    db.all('SELECT * FROM training_programs ORDER BY created_at DESC', [], (err, programs) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // We want to fetch enrollments for these programs too
        db.all(`
      SELECT 
        et.*, e.first_name, e.last_name, e.department
      FROM employee_training et
      JOIN employees e ON et.employee_id = e.employee_id
    `, [], (err, enrollments) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            // Embed enrollments in programs
            const data = programs.map(prog => {
                return {
                    ...prog,
                    enrollments: enrollments.filter(e => e.training_id === prog.id)
                };
            });

            res.json({ success: true, data });
        });
    });
};

// POST /api/training/assign
const assignTraining = (req, res) => {
    const { employee_id, training_id } = req.body;
    if (!employee_id || !training_id) return res.status(400).json({ success: false, message: 'Employee ID and Training ID required.' });

    const db = getDb();
    db.run(
        `INSERT INTO employee_training (employee_id, training_id, status) VALUES (?, ?, 'Enrolled')`,
        [employee_id, training_id],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ success: false, message: 'Employee is already enrolled in this training.' });
                }
                return res.status(500).json({ success: false, message: err.message });
            }
            res.json({ success: true, message: 'Training assigned successfully.' });
        }
    );
};

// PUT /api/training/:id/complete
const completeTraining = (req, res) => {
    const { id } = req.params; // This is the employee_training record ID
    const { certificate_link } = req.body;

    const db = getDb();
    db.run(
        `UPDATE employee_training 
     SET status = 'Completed', completion_date = CURRENT_TIMESTAMP, certificate_link = ? 
     WHERE id = ?`,
        [certificate_link, id],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (this.changes === 0) return res.status(404).json({ success: false, message: 'Enrollment record not found.' });

            res.json({ success: true, message: 'Training marked as completed.' });
        }
    );
};

// GET /api/training/enrollments
const getEnrollments = (req, res) => {
    const db = getDb();
    db.all(`
        SELECT et.*, tp.title, e.first_name, e.last_name
        FROM employee_training et
        JOIN training_programs tp ON et.training_id = tp.id
        JOIN employees e ON et.employee_id = e.employee_id
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
};

module.exports = { createTraining, getAllTraining, assignTraining, completeTraining, getEnrollments };
