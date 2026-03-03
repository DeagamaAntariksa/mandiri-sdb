import { createPool } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config();

// Vercel Postgres Pool
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export default pool;
