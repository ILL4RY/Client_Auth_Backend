import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

pool.connect()
    .then(() => console.log('PostgreSQL connected successfully'))
    .catch(err => console.error('PostgreSQL connection error: ', err));
