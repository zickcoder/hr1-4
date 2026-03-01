const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    console.log('Starting migration to update users table constraints...');

    // 1. Rename existing users table to a backup
    db.run("ALTER TABLE users RENAME TO users_old", (err) => {
        if (err) {
            console.error('Error renaming users table:', err.message);
            process.exit(1);
        }
        console.log('Renamed users table to users_old');

        // 2. Create the new users table with the correct CHECK constraint
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('SuperAdmin', 'HRAdmin', 'Employee')),
                employee_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating new users table:', err.message);
                process.exit(1);
            }
            console.log('Created new users table with updated CHECK constraint');

            // 3. Copy data from old table to new table
            // We'll use COALESCE or simply map columns. employee_id might be missing in some old rows if they weren't updated.
            db.run(`
                INSERT INTO users (id, name, email, password_hash, role, employee_id, created_at)
                SELECT id, name, email, password_hash, role, employee_id, created_at FROM users_old
            `, (err) => {
                if (err) {
                    console.error('Error migrating data:', err.message);
                    // attempt to rollback if it fails catastrophiclly (manually)
                    process.exit(1);
                }
                console.log('Migrated data to new users table');

                // 4. Drop the old table
                db.run("DROP TABLE users_old", (err) => {
                    if (err) {
                        console.error('Error dropping old table:', err.message);
                    } else {
                        console.log('Dropped users_old table');
                    }
                    console.log('Migration completed successfully.');
                    db.close();
                });
            });
        });
    });
});
