const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    console.log('Checking for temporary_password column...');
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            process.exit(1);
        }

        const hasTempPass = rows.some(row => row.name === 'temporary_password');

        if (!hasTempPass) {
            console.log('Adding temporary_password column...');
            db.run("ALTER TABLE users ADD COLUMN temporary_password TEXT", (err) => {
                if (err) {
                    console.error('Error adding column:', err.message);
                    process.exit(1);
                }
                console.log('Column added successfully.');
                db.close();
            });
        } else {
            console.log('Column already exists.');
            db.close();
        }
    });
});
