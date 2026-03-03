import pool from './db.js';

async function describeTable() {
    try {
        const [rows] = await pool.query('DESCRIBE applications');
        console.log('--- APPLICATIONS TABLE SCHEMA ---');
        console.table(rows);

        const [invRows] = await pool.query('DESCRIBE box_inventory');
        console.log('\n--- BOX_INVENTORY TABLE SCHEMA ---');
        console.table(invRows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

describeTable();
