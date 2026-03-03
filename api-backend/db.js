import { createPool } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config();

// Safe Vercel Postgres Pool creation
let pool;
if (process.env.POSTGRES_URL) {
  pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });
} else {
  // Dummy pool that throws helpful errors instead of crashing the whole app
  pool = {
    query: () => {
      throw new Error('Database not connected. Please click "Connect" in Vercel Storage dashboard.');
    }
  };
  console.warn('POSTGRES_URL is missing. Database functionality will be unavailable.');
}

export default pool;
