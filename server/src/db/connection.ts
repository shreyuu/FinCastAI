import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // Fail loudly at startup rather than at the first query. See .env.example.
  throw new Error(
    `Missing required database environment variables: ${missing.join(", ")}. ` +
      `Copy server/.env.example to server/.env and fill it in.`
  );
}

// A pool rather than a single connection: a lone connection that MySQL closes
// (wait_timeout, a restart, a network blip) never comes back, and every later
// query fails until the process restarts. The pool drops a broken connection
// and opens a new one on the next query. Connections open lazily, so a
// database that is down shows up as an error on that query.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  // Format any object placeholder value as a string rather than as SQL
  // `key` = value pairs (defence in depth for the checks in server.ts).
  stringifyObjects: true,
});

export default pool;
