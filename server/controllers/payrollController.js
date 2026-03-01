const { getDb } = require('../models/db');

// POST /api/payroll/generate
// Generates payroll for all active employees for a given month/year
const generatePayroll = (req, res) => {
    const { month, year } = req.body;

    if (!month || !year) {
        return res.status(400).json({ success: false, message: 'Month and year are required.' });
    }

    const db = getDb();

    // Get all active employees and their salary structure
    const query = `
    SELECT 
      e.employee_id,
      COALESCE(s.basic_salary, 0) as basic_salary,
      COALESCE(s.allowance, 0) as allowance,
      COALESCE(s.deduction_per_absence, 0) as deduction_per_absence
    FROM employees e
    LEFT JOIN salary_structure s ON e.employee_id = s.employee_id
    WHERE e.is_active = 1
  `;

    db.all(query, [], (err, employees) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (employees.length === 0) return res.status(404).json({ success: false, message: 'No active employees found.' });

        let count = 0;
        let errors = [];

        // Simulate 20 working days standard for MVP
        const standardDays = 20;

        employees.forEach((emp) => {
            // For MVP without attendance module, defaults to 0 absences
            // If attendance was implemented, we'd query it here.
            const absences = 0;
            const days_worked = standardDays - absences;

            const gross = emp.basic_salary + emp.allowance;
            const deductions = absences * emp.deduction_per_absence;
            const net = gross - deductions;

            db.run(
                `INSERT INTO payroll (employee_id, month, year, days_worked, absences, gross_salary, total_deductions, net_salary, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
         ON CONFLICT(employee_id, month, year) DO UPDATE SET
           days_worked = ?,
           absences = ?,
           gross_salary = ?,
           total_deductions = ?,
           net_salary = ?,
           updated_at = CURRENT_TIMESTAMP`,
                [
                    emp.employee_id, month, year, days_worked, absences, gross, deductions, net,
                    days_worked, absences, gross, deductions, net
                ],
                function (err) {
                    if (err) errors.push(`Employee ${emp.employee_id}: ${err.message}`);

                    count++;
                    if (count === employees.length) {
                        if (errors.length > 0) {
                            res.status(207).json({ success: true, message: 'Payroll generated with some errors.', errors });
                        } else {
                            res.json({ success: true, message: `Payroll generated successfully for ${count} employees.` });
                        }
                    }
                }
            );
        });
    });
};

// GET /api/payroll
const getAllPayrolls = (req, res) => {
    const { month, year } = req.query;
    const db = getDb();

    let query = `
    SELECT 
      p.*, e.first_name, e.last_name, e.department, e.position
    FROM payroll p
    JOIN employees e ON p.employee_id = e.employee_id
  `;
    const params = [];

    if (month && year) {
        query += ' WHERE p.month = ? AND p.year = ?';
        params.push(month, year);
    }

    query += ' ORDER BY p.year DESC, p.month DESC, e.first_name ASC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
};

// GET /api/payroll/:employee_id
const getEmployeePayrolls = (req, res) => {
    const { employee_id } = req.params;
    const db = getDb();

    db.all(
        'SELECT * FROM payroll WHERE employee_id = ? ORDER BY year DESC, month DESC',
        [employee_id],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: rows });
        }
    );
};

// PUT /api/payroll/:id
// Update status (Approve, Paid)
const updatePayrollStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Paid'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const db = getDb();

    db.run(
        'UPDATE payroll SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (this.changes === 0) return res.status(404).json({ success: false, message: 'Payroll record not found.' });

            res.json({ success: true, message: `Payroll marked as ${status}.` });
        }
    );
};

module.exports = { generatePayroll, getAllPayrolls, getEmployeePayrolls, updatePayrollStatus };
