import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mandiri_sdb',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }, // Required for Aiven
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
