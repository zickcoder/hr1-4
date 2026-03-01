const bcrypt = require('bcryptjs');
const { getDb } = require('../models/db');
const crypto = require('crypto');

const generateSecurePassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";

    // Ensure at least one of each required type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[crypto.randomInt(26)];
    password += "abcdefghijklmnopqrstuvwxyz"[crypto.randomInt(26)];
    password += "0123456789"[crypto.randomInt(10)];
    password += "!@#$%^&*()_+"[crypto.randomInt(12)];

    for (let i = password.length; i < length; i++) {
        password += charset[crypto.randomInt(charset.length)];
    }

    // Shuffle
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// POST /api/users/create-employee-account
const createEmployeeAccount = (req, res) => {
    const { employee_id, email } = req.body; // Remove manual password from req.body

    if (!employee_id || !email) {
        return res.status(400).json({ success: false, message: 'employee_id and email are required.' });
    }

    const password = generateSecurePassword(14); // Generate automatically
    const db = getDb();

    console.log(`Attempting to create account for employee_id: ${employee_id}, email: ${email}`);

    // 1. Check if employee exists
    db.get('SELECT first_name, last_name FROM employees WHERE employee_id = ?', [employee_id], (err, employee) => {
        if (err) {
            console.error('DB Error checking employee:', err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!employee) {
            console.warn(`Employee not found with id: ${employee_id}`);
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        // 2. Check if employee already has a user account
        db.get('SELECT id FROM users WHERE employee_id = ?', [employee_id], (err, existingUser) => {
            if (err) {
                console.error('DB Error checking existing user:', err.message);
                return res.status(500).json({ success: false, message: err.message });
            }
            if (existingUser) {
                console.warn(`Employee ${employee_id} already has a user account: ${existingUser.id}`);
                return res.status(400).json({ success: false, message: 'This employee already has an account.' });
            }

            // 3. Check duplicate email in users table
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, emailExists) => {
                if (err) {
                    console.error('DB Error checking email exists:', err.message);
                    return res.status(500).json({ success: false, message: err.message });
                }
                if (emailExists) {
                    console.warn(`Email already in use: ${email}`);
                    return res.status(409).json({ success: false, message: 'This email is already taken by another user account.' });
                }

                // 4. Create the account
                const name = `${employee.first_name} ${employee.last_name}`;
                const salt = bcrypt.genSaltSync(10);
                const password_hash = bcrypt.hashSync(password, salt);

                console.log(`Inserting new user: ${name} (${email}) with generated password`);
                db.run(
                    'INSERT INTO users (name, email, password_hash, role, employee_id, temporary_password) VALUES (?, ?, ?, ?, ?, ?)',
                    [name, email, password_hash, 'Employee', employee_id, password],
                    function (err) {
                        if (err) {
                            console.error('DB Error inserting user:', err.message);
                            return res.status(500).json({ success: false, message: err.message });
                        }
                        console.log(`User created successfully with ID: ${this.lastID}`);
                        res.status(201).json({
                            success: true,
                            message: 'Employee account created successfully.',
                            data: {
                                id: this.lastID,
                                password: password // Return the generated password to frontend
                            }
                        });
                    }
                );
            });
        });
    });
};

module.exports = { createEmployeeAccount };
