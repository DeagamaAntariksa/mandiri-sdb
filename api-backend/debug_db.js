import pool from './db.js';

async function debugDB() {
    try {
        const [columns] = await pool.query('SHOW COLUMNS FROM applications');
        console.log('--- Applications Columns ---');
        console.log(columns.map(c => `${c.Field} (${c.Type})`));

        const [rows] = await pool.query('SELECT id, box_size, box_number, box_room, status FROM applications ORDER BY id DESC LIMIT 10');
        console.log('\n--- Recent Applications ---');
        console.log(rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugDB();
