const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    // Check columns in users table
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error('Error getting table info:', err.message);
            process.exit(1);
        }

        const hasEmployeeId = rows.some(row => row.name === 'employee_id');

        if (!hasEmployeeId) {
            console.log('Column employee_id missing in users table. Adding it...');
            db.run("ALTER TABLE users ADD COLUMN employee_id INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL", (err) => {
                if (err) {
                    console.error('Error adding column:', err.message);
                    process.exit(1);
                }
                console.log('Column employee_id added successfully.');
                db.close();
            });
        } else {
            console.log('Column employee_id already exists in users table.');
            db.close();
        }
    });
});
