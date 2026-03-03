import pool from './db.js';

async function queryPending() {
    try {
        const [rows] = await pool.query("SELECT id, full_name, status, box_size FROM applications WHERE status = 'pending' LIMIT 5");
        console.log('--- PENDING APPLICATIONS ---');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

queryPending();
