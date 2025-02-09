import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse the CA certificate
const ca = process.env.CA?.replace(/\\n/g, '\n');

const pool = new Pool({
  user: process.env.USER_NAME,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 27799,
  ssl: {
    rejectUnauthorized: true,
    ca: ca,
  },
});

export default pool;
