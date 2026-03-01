const { getDb } = require('../models/db');

// POST /api/competencies
const createCompetency = (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Competency name is required.' });

    const db = getDb();
    db.run(
        'INSERT INTO competencies (name, description) VALUES (?, ?)',
        [name, description],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ success: false, message: 'Competency already exists.' });
                return res.status(500).json({ success: false, message: err.message });
            }
            res.status(201).json({ success: true, message: 'Competency created.', id: this.lastID });
        }
    );
};

// GET /api/competencies
// Gets all competencies. Can optionally get employees assigned to each model.
const getAllCompetencies = (req, res) => {
    const db = getDb();

    db.all('SELECT * FROM competencies ORDER BY name ASC', [], (err, comps) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // Fetch assigned skills
        db.all(`
      SELECT 
        ec.*, e.first_name, e.last_name, e.department, e.position
      FROM employee_competencies ec
      JOIN employees e ON ec.employee_id = e.employee_id
    `, [], (err, assignments) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            const data = comps.map(comp => ({
                ...comp,
                employees: assignments ? assignments.filter(a => a.competency_id === comp.id) : []
            }));

            res.json({ success: true, data });
        });
    });
};

// POST /api/competencies/assign
// Assign or update a competency level for an employee
const assignCompetency = (req, res) => {
    const { employee_id, competency_id, level } = req.body;

    if (!employee_id || !competency_id || !level) {
        return res.status(400).json({ success: false, message: 'Employee ID, Competency ID, and Level required.' });
    }

    const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (!validLevels.includes(level)) {
        return res.status(400).json({ success: false, message: 'Invalid competency level.' });
    }

    const db = getDb();
    db.run(
        `INSERT INTO employee_competencies (employee_id, competency_id, level) 
     VALUES (?, ?, ?)
     ON CONFLICT(employee_id, competency_id) DO UPDATE SET level = ?`,
        [employee_id, competency_id, level, level],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'Competency level assigned/updated successfully.' });
        }
    );
};

module.exports = { createCompetency, getAllCompetencies, assignCompetency };
