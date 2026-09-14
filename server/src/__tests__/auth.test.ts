/**
 * Characterisation tests for the auth server.
 *
 * The MySQL connection is mocked, so these run with no database.
 *
 * SEC-01 is fixed as of phase 3: passwords are bcrypt-hashed on signup and
 * compared with bcrypt.compare on login. Accounts that predate hashing were
 * blanked by migration 001 and are rejected with 403 PASSWORD_RESET_REQUIRED
 * until an operator sets a new password (npm run set-password).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
// vi.mock below is hoisted above this import, so `app` gets the fake db.
import { app } from "../server";

/** Rows the fake database will return for the next SELECT. */
let selectRows: Record<string, unknown>[] = [];
/** Error the fake database will raise, if any. */
let queryError: Error | null = null;
/** Every (sql, params) pair the app issued. */
let issued: Array<{ sql: string; params: unknown[] }> = [];

vi.mock("../db/connection", () => ({
  default: {
    query: (sql: string, params: unknown[], cb: Function) => {
      issued.push({ sql, params });
      if (queryError) return cb(queryError, null);
      if (/^\s*SELECT/i.test(sql)) return cb(null, selectRows);
      return cb(null, { insertId: 42, affectedRows: 1 });
    },
  },
}));

beforeEach(() => {
  selectRows = [];
  queryError = null;
  issued = [];
});

const validUser = {
  name: "Asha Rao",
  email: "asha@example.com",
  password: "correct-horse",
  dob: "1995-04-12",
  gender: "Female",
};

describe("POST /users (signup)", () => {
  it("creates a user and returns the new id without echoing the password", async () => {
    const res = await request(app).post("/users").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User created successfully");
    expect(res.body.user).toEqual({
      id: 42,
      name: validUser.name,
      email: validUser.email,
      dob: validUser.dob,
      gender: validUser.gender,
    });
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("checks for an existing account before inserting", async () => {
    await request(app).post("/users").send(validUser);

    expect(issued).toHaveLength(2);
    expect(issued[0].sql).toMatch(/^SELECT/i);
    expect(issued[0].params).toEqual([validUser.email]);
    expect(issued[1].sql).toMatch(/^INSERT/i);
  });

  it("rejects a duplicate email with 409 and does not insert", async () => {
    selectRows = [{ id: 1, email: validUser.email }];

    const res = await request(app).post("/users").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("User already exists.");
    expect(issued.filter((q) => /^INSERT/i.test(q.sql))).toHaveLength(0);
  });

  it.each(["name", "email", "password", "dob", "gender"])(
    "rejects a signup missing %s",
    async (field) => {
      const body: Record<string, unknown> = { ...validUser };
      delete body[field];

      const res = await request(app).post("/users").send(body);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("All fields are required.");
      expect(issued).toHaveLength(0);
    }
  );

  it("returns 500 when the database errors", async () => {
    queryError = new Error("connection lost");

    const res = await request(app).post("/users").send(validUser);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Server error.");
  });

  it("stores a bcrypt hash, never the submitted password", async () => {
    await request(app).post("/users").send(validUser);

    const insert = issued.find((q) => /^INSERT/i.test(q.sql))!;
    expect(insert.params).not.toContain(validUser.password);

    const stored = insert.params[2] as string;
    expect(stored).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(await bcrypt.compare(validUser.password, stored)).toBe(true);
  });

  it("produces a different hash each time the same password is used", async () => {
    await request(app).post("/users").send(validUser);
    const first = issued.find((q) => /^INSERT/i.test(q.sql))!.params[2];

    issued = [];
    await request(app).post("/users").send(validUser);
    const second = issued.find((q) => /^INSERT/i.test(q.sql))!.params[2];

    expect(first).not.toBe(second); // bcrypt salts per call
  });
});

describe("POST /users/login", () => {
  const PLAINTEXT = "correct-horse";
  let storedUser: Record<string, unknown>;

  beforeEach(async () => {
    storedUser = {
      id: 42,
      name: "Asha Rao",
      email: "asha@example.com",
      password: await bcrypt.hash(PLAINTEXT, 10),
    };
  });

  it("rejects a wrong password with 401", async () => {
    selectRows = [{ ...storedUser }];

    const res = await request(app)
      .post("/users/login")
      .send({ email: storedUser.email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Incorrect password.");
    expect(res.body).not.toHaveProperty("user");
  });

  it("accepts the right password and strips the password from the response", async () => {
    selectRows = [{ ...storedUser }];

    const res = await request(app)
      .post("/users/login")
      .send({ email: storedUser.email, password: PLAINTEXT });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.user).toEqual({
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
    });
  });

  it("does not leak dob, gender or the hash in the login response", async () => {
    selectRows = [{ ...storedUser, dob: "1995-04-12", gender: "Female" }];

    const res = await request(app)
      .post("/users/login")
      .send({ email: storedUser.email, password: PLAINTEXT });

    for (const field of ["password", "dob", "gender"]) {
      expect(res.body.user).not.toHaveProperty(field);
    }
  });

  it("returns 404 for an unknown email", async () => {
    selectRows = [];

    const res = await request(app)
      .post("/users/login")
      .send({ email: "nobody@example.com", password: "x" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found.");
  });

  it("returns 500 when the database errors", async () => {
    queryError = new Error("connection lost");

    const res = await request(app)
      .post("/users/login")
      .send({ email: storedUser.email, password: "x" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Database error.");
  });

  it("looks the user up by email", async () => {
    selectRows = [{ ...storedUser }];

    await request(app)
      .post("/users/login")
      .send({ email: storedUser.email, password: PLAINTEXT });

    expect(issued[0].sql).toMatch(/^SELECT .* FROM users WHERE email = \?/i);
    expect(issued[0].params).toEqual([storedUser.email]);
  });

  it("never accepts a raw stored value as the password", async () => {
    // Guards against a regression to string equality: if the stored hash were
    // compared directly, sending it as the password would authenticate.
    selectRows = [{ ...storedUser }];

    const res = await request(app)
      .post("/users/login")
      .send({ email: storedUser.email, password: storedUser.password });

    expect(res.status).toBe(401);
  });
});

describe("forced password reset (SEC-01 migration)", () => {
  const legacyEmail = "legacy@example.com";

  it.each([
    ["blanked by migration 001", ""],
    ["still plaintext (migration not yet run)", "correct-horse"],
    ["null", null],
  ])("rejects an account whose password is %s", async (_label, stored) => {
    selectRows = [{ id: 7, email: legacyEmail, password: stored }];

    const res = await request(app)
      .post("/users/login")
      .send({ email: legacyEmail, password: "correct-horse" });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("PASSWORD_RESET_REQUIRED");
    expect(res.body).not.toHaveProperty("user");
  });

  it("lets the account sign in again once a bcrypt hash is set", async () => {
    selectRows = [
      {
        id: 7,
        email: legacyEmail,
        password: await bcrypt.hash("brand-new-password", 10),
      },
    ];

    const res = await request(app)
      .post("/users/login")
      .send({ email: legacyEmail, password: "brand-new-password" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
  });
});
