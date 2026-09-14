/**
 * Set a user's password, hashed with bcrypt.
 *
 *   npm run set-password -- user@example.com
 *
 * Prompts for the new password without echoing it. Requires database access,
 * which is deliberately the only way to complete a forced reset: there is no
 * email service in this project, so a self-serve "reset my password" endpoint
 * could not verify who is asking and would be an account-takeover vector.
 *
 * Replace this with a token-based email flow when mail sending exists.
 */

import bcrypt from "bcryptjs";
import readline from "readline";
import { Writable } from "stream";
import db from "../src/db/connection";

const BCRYPT_ROUNDS = 10;
const MIN_LENGTH = 6; // matches the client-side rule in SignIn/SignUpForm

function promptHidden(question: string): Promise<string> {
  let muted = false;
  const mutedOut = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: mutedOut,
    terminal: true,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npm run set-password -- <email>");
    process.exit(1);
  }

  const password = await promptHidden(`New password for ${email}: `);
  const confirm = await promptHidden("Confirm password: ");

  if (password !== confirm) {
    console.error("Passwords do not match. Nothing was changed.");
    process.exit(1);
  }

  if (password.length < MIN_LENGTH) {
    console.error(`Password must be at least ${MIN_LENGTH} characters.`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

  db.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [hashed, email],
    (err, result) => {
      if (err) {
        console.error("Failed to update password:", err.message);
        process.exit(1);
      }

      const affected = (result as { affectedRows: number }).affectedRows;
      if (affected === 0) {
        console.error(`No account found for ${email}. Nothing was changed.`);
        process.exit(1);
      }

      console.log(`Password updated for ${email}.`);
      db.end();
    }
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
