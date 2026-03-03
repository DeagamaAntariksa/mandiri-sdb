import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        const [rows] = await connection.query('SELECT * FROM admins');
        console.log('Admins in DB:', rows);
        await connection.end();
    } catch (err) {
        console.error('Check failed:', err);
    }
}
test();
