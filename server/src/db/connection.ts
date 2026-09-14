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

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

// Without this, a connection failure surfaces as an unhandled AggregateError
// and takes the whole process down with no usable message.
connection.on("error", (err) => {
  console.error("Database connection error:", err.code, err.message);
});

export default connection;
