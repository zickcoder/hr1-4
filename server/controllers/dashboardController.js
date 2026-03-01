const { getDb } = require('../models/db');

// Helper to wrap db.get in a promise for async/await
const dbGet = (query, params = []) => {
    return new Promise((resolve, reject) => {
        getDb().get(query, params, (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
};

const dbAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
        getDb().all(query, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

// GET /api/dashboard/summary
const getSummary = async (req, res) => {
    try {
        const total_employees = await dbGet('SELECT COUNT(*) as count FROM employees');
        const active_employees = await dbGet('SELECT COUNT(*) as count FROM employees WHERE is_active = 1');
        const total_applicants = await dbGet('SELECT COUNT(*) as count FROM applicants');

        const currentMonth = new Date().toISOString().substring(0, 7) + '%';
        const hired_this_month = await dbGet('SELECT COUNT(*) as count FROM employees WHERE date_hired LIKE ? OR created_at LIKE ?', [currentMonth, currentMonth]);

        // MVP: No leave module built, hardcode to 0 for now to prevent breaking, or assume 0
        const employees_on_leave = { count: 0 };

        // Monthly payroll total for current month
        const thisMonth = new Date().getMonth() + 1;
        const thisYear = new Date().getFullYear();
        const monthly_payroll_total = await dbGet('SELECT SUM(net_salary) as total FROM payroll WHERE month = ? AND year = ?', [thisMonth, thisYear]);

        res.json({
            success: true,
            data: {
                total_employees: total_employees.count,
                active_employees: active_employees.count,
                total_applicants: total_applicants.count,
                hired_this_month: hired_this_month.count,
                employees_on_leave: employees_on_leave.count,
                monthly_payroll_total: monthly_payroll_total.total || 0
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/dashboard/hiring-trend
const getHiringTrend = async (req, res) => {
    try {
        // Group by month created using SQLite strftime
        const rows = await dbAll(`
      SELECT 
        strftime('%Y-%m', created_at) as month, 
        COUNT(*) as count 
      FROM employees 
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
      LIMIT 6
    `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/dashboard/attendance-overview
const getAttendanceOverview = async (req, res) => {
    try {
        // MVP: No attendance module built, return mock zero data so the frontend doesn't crash
        res.json({ success: true, data: { present: 100, absent: 0, leave: 0 } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/dashboard/payroll-trend
const getPayrollTrend = async (req, res) => {
    try {
        const rows = await dbAll(`
      SELECT 
        year, month, 
        SUM(net_salary) as total_net, 
        SUM(gross_salary) as total_gross 
      FROM payroll 
      GROUP BY year, month 
      ORDER BY year ASC, month ASC 
      LIMIT 6
    `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/dashboard/training-completion
const getTrainingCompletion = async (req, res) => {
    try {
        const rows = await dbAll(`
      SELECT 
        status, 
        COUNT(*) as count 
      FROM employee_training 
      GROUP BY status
    `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getSummary,
    getHiringTrend,
    getAttendanceOverview,
    getPayrollTrend,
    getTrainingCompletion
};
