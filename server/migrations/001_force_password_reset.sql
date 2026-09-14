-- 001_force_password_reset.sql
--
-- Passwords were stored in plaintext (SEC-01). This migration destroys every
-- such value so none of them can be used to sign in. Affected accounts get a
-- 403 PASSWORD_RESET_REQUIRED from POST /users/login until an operator sets a
-- new password with `npm run set-password`.
--
-- Run once, against the application database:
--   mysql -u <user> -p <database> < migrations/001_force_password_reset.sql
--
-- The WHERE clause makes this safe to re-run: rows already holding a bcrypt
-- hash ($2a$/$2b$/$2y$ prefix) are left alone.
--
-- NOTE: this is destructive and irreversible. The plaintext values are gone
-- after it runs. That is the point -- they were readable by anyone with table
-- access -- but take a backup first if you need an audit trail.

START TRANSACTION;

-- How many accounts are about to be locked out (run before, to know the blast
-- radius):
--   SELECT COUNT(*) FROM users WHERE password NOT LIKE '$2%';

UPDATE users
SET password = ''
WHERE password IS NULL
   OR password NOT LIKE '$2%';

COMMIT;
