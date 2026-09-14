import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { OkPacket, RowDataPacket } from "mysql2";
import db from "./db/connection";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const BCRYPT_ROUNDS = 10;

app.use(cors());
app.use(express.json());

/**
 * Passwords were previously stored in plaintext. Migration 001 blanks every
 * such value, so any stored password that is not a bcrypt hash belongs to an
 * account that must set a new password before it can sign in again.
 */
function isBcryptHash(stored: unknown): stored is string {
  return typeof stored === "string" && /^\$2[aby]\$\d{2}\$.{53}$/.test(stored);
}

app.post("/users", (req: Request, res: Response) => {
  const { name, email, password, dob, gender } = req.body;

  if (!name || !email || !password || !dob || !gender) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  db.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error checking user:", err);
        res.status(500).json({ error: "Server error." });
        return;
      }

      if (Array.isArray(results) && results.length > 0) {
        res.status(409).json({ error: "User already exists." });
        return;
      }

      bcrypt.hash(password, BCRYPT_ROUNDS, (hashErr, hashed) => {
        if (hashErr) {
          console.error("Error hashing password:", hashErr);
          res.status(500).json({ error: "Server error." });
          return;
        }

        db.query(
          "INSERT INTO users (name, email, password, dob, gender) VALUES (?, ?, ?, ?, ?)",
          [name, email, hashed, dob, gender],
          (insertErr, insertResults) => {
            if (insertErr) {
              console.error("Error inserting user:", insertErr);
              res.status(500).json({ error: "Server error." });
              return;
            }

            res.status(201).json({
              message: "User created successfully",
              user: {
                id: (insertResults as OkPacket).insertId,
                name,
                email,
                dob,
                gender,
              },
            });
          }
        );
      });
    }
  );
});

app.post("/users/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  db.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Database error." });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      const user = results[0];

      if (!isBcryptHash(user.password)) {
        // Account predates password hashing. Its old password was destroyed by
        // migration 001 and cannot be used; an operator must set a new one.
        res.status(403).json({
          error:
            "Your password must be reset before you can sign in. " +
            "Please contact support to set a new password.",
          code: "PASSWORD_RESET_REQUIRED",
        });
        return;
      }

      bcrypt.compare(password, user.password, (compareErr, matches) => {
        if (compareErr) {
          res.status(500).json({ error: "Database error." });
          return;
        }

        if (!matches) {
          res.status(401).json({ error: "Incorrect password." });
          return;
        }

        delete user.password;
        res.status(200).json({ message: "Login successful", user });
      });
    }
  );
});

// Export the app so tests can mount it without binding a port.
export { app };
export default app;

// Only listen when run directly (`ts-node src/server.ts`), not when imported.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
