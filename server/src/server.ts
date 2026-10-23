import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { rateLimit, MemoryStore } from "express-rate-limit";
import { OkPacket, RowDataPacket } from "mysql2";
import db from "./db/connection";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const BCRYPT_ROUNDS = 10;
// Comma-separated browser origins allowed to call this API (the Vite app).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// Per-IP limits, held in memory, so they apply per process. Behind a reverse
// proxy, set `app.set("trust proxy", ...)` or every client shares one IP.
// The stores are exported so tests can reset them between cases.
export const loginLimiterStore = new MemoryStore();
export const signupLimiterStore = new MemoryStore();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // Only failed attempts count, so a user who signs in normally is never locked out.
  skipSuccessfulRequests: true,
  store: loginLimiterStore,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  store: signupLimiterStore,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many sign-ups from this address. Please try again later." },
});

/**
 * Passwords were previously stored in plaintext. Migration 001 blanks every
 * such value, so any stored password that is not a bcrypt hash belongs to an
 * account that must set a new password before it can sign in again.
 */
function isBcryptHash(stored: unknown): stored is string {
  return typeof stored === "string" && /^\$2[aby]\$\d{2}\$.{53}$/.test(stored);
}

/**
 * mysql2 formats an object placeholder value as `key` = value pairs, so
 * {"email": {"email": 1}} turns `WHERE email = ?` into a condition that matches
 * every row. Only non-empty strings may reach a query.
 */
function allNonEmptyStrings(...values: unknown[]): boolean {
  return values.every((v) => typeof v === "string" && v.length > 0);
}

// Unknown emails and wrong passwords get the same answer, and an unknown email
// still pays for one bcrypt compare (against this hash), so neither the body
// nor the response time reveals whether an account exists.
const INVALID_LOGIN = { error: "Invalid email or password." };
const TIMING_DUMMY_HASH = bcrypt.hashSync("timing-equaliser", BCRYPT_ROUNDS);

const MIN_PASSWORD_LENGTH = 6; // same rule as SignUpForm and set-password
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 255; // users.name is VARCHAR(255)
const GENDERS = ["Male", "Female", "Other"];

/** True for a real calendar date in YYYY-MM-DD form that is not in the future. */
function isPastIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value &&
    parsed.getTime() <= Date.now()
  );
}

/**
 * The client-side rules from SignUpForm, enforced where they cannot be skipped.
 * Returns the message to show, or null when the signup is valid.
 */
function signupError(name: string, email: string, password: string, dob: string, gender: string) {
  if (name.trim().length === 0 || name.length > MAX_NAME_LENGTH) {
    return `Name must be 1 to ${MAX_NAME_LENGTH} characters.`;
  }
  // Length is checked first so the regex only ever sees short input.
  if (email.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address.";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!isPastIsoDate(dob)) {
    return "Date of birth must be a valid past date (YYYY-MM-DD).";
  }
  if (!GENDERS.includes(gender)) {
    return `Gender must be one of ${GENDERS.join(", ")}.`;
  }
  return null;
}

app.post("/users", signupLimiter, (req: Request, res: Response) => {
  const { name, email, password, dob, gender } = req.body ?? {};

  if (!allNonEmptyStrings(name, email, password, dob, gender)) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  const invalid = signupError(name, email, password, dob, gender);
  if (invalid) {
    res.status(400).json({ error: invalid });
    return;
  }

  db.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error checking user:", err.code, err.message);
        res.status(500).json({ error: "Server error." });
        return;
      }

      if (Array.isArray(results) && results.length > 0) {
        res.status(409).json({ error: "User already exists." });
        return;
      }

      bcrypt.hash(password, BCRYPT_ROUNDS, (hashErr, hashed) => {
        if (hashErr) {
          console.error("Error hashing password:", hashErr.message);
          res.status(500).json({ error: "Server error." });
          return;
        }

        db.query(
          "INSERT INTO users (name, email, password, dob, gender) VALUES (?, ?, ?, ?, ?)",
          [name, email, hashed, dob, gender],
          (insertErr, insertResults) => {
            if (insertErr) {
              // Two signups for one email can both pass the SELECT above; the
              // UNIQUE key on users.email makes the second INSERT fail.
              if (insertErr.code === "ER_DUP_ENTRY") {
                res.status(409).json({ error: "User already exists." });
                return;
              }
              // Not the error object itself: mysql2 attaches the full SQL,
              // with the user's details and password hash inlined.
              console.error("Error inserting user:", insertErr.code, insertErr.message);
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

app.post("/users/login", loginLimiter, (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!allNonEmptyStrings(email, password)) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  db.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Database error." });
        return;
      }

      if (results.length === 0) {
        bcrypt.compare(password, TIMING_DUMMY_HASH, () => {
          res.status(401).json(INVALID_LOGIN);
        });
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
          res.status(401).json(INVALID_LOGIN);
          return;
        }

        // Return only what the client uses, rather than the whole row.
        // `delete user.password` left dob and gender in the payload, which the
        // client then persisted to localStorage for no reason.
        res.status(200).json({
          message: "Login successful",
          user: { id: user.id, name: user.name, email: user.email },
        });
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
