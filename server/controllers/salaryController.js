const { getDb } = require('../models/db');

// POST /api/salary
const createOrUpdateSalary = (req, res) => {
    const { employee_id, basic_salary, allowance, deduction_per_absence } = req.body;

    if (!employee_id || basic_salary === undefined) {
        return res.status(400).json({ success: false, message: 'Employee ID and Basic Salary are required.' });
    }

    const db = getDb();

    // Check if employee exists
    db.get('SELECT employee_id FROM employees WHERE employee_id = ?', [employee_id], (err, emp) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!emp) return res.status(404).json({ success: false, message: 'Employee not found.' });

        // Check if salary structure already exists
        db.get('SELECT id FROM salary_structure WHERE employee_id = ?', [employee_id], (err, existing) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            if (existing) {
                // Update
                db.run(
                    `UPDATE salary_structure SET
            basic_salary = ?,
            allowance = ?,
            deduction_per_absence = ?,
            updated_at = CURRENT_TIMESTAMP
           WHERE employee_id = ?`,
                    [basic_salary, allowance || 0, deduction_per_absence || 0, employee_id],
                    function (err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.json({ success: true, message: 'Salary structure updated successfully.' });
                    }
                );
            } else {
                // Insert
                db.run(
                    `INSERT INTO salary_structure (employee_id, basic_salary, allowance, deduction_per_absence)
           VALUES (?, ?, ?, ?)`,
                    [employee_id, basic_salary, allowance || 0, deduction_per_absence || 0],
                    function (err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.status(201).json({ success: true, message: 'Salary structure created successfully.' });
                    }
                );
            }
        });
    });
};

// GET /api/salary/:employee_id
const getSalary = (req, res) => {
    const { employee_id } = req.params;
    const db = getDb();

    db.get('SELECT * FROM salary_structure WHERE employee_id = ?', [employee_id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // If not found, return zeroes (no config yet)
        if (!row) {
            return res.json({
                success: true,
                data: { employee_id: parseInt(employee_id), basic_salary: 0, allowance: 0, deduction_per_absence: 0 }
            });
        }

        res.json({ success: true, data: row });
    });
};

// GET /api/salary (Get all salaries with employee details)
const getAllSalaries = (req, res) => {
    const db = getDb();
    const query = `
    SELECT 
      e.employee_id, e.first_name, e.last_name, e.department, e.position,
      COALESCE(s.basic_salary, 0) as basic_salary,
      COALESCE(s.allowance, 0) as allowance,
      COALESCE(s.deduction_per_absence, 0) as deduction_per_absence
    FROM employees e
    LEFT JOIN salary_structure s ON e.employee_id = s.employee_id
    WHERE e.is_active = 1
    ORDER BY e.first_name ASC
  `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
};

module.exports = { createOrUpdateSalary, getSalary, getAllSalaries };
