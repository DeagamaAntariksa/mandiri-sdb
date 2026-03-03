import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
        const [rows] = await connection.query('SHOW DATABASES');
        console.log('Available Databases:');
        console.log(rows.map(r => r.Database));
        await connection.end();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}
test();
