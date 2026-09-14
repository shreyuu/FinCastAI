/**
 * Characterisation tests for the auth server.
 *
 * The MySQL connection is mocked, so these run with no database. They pin
 * current behaviour — including SEC-01, where passwords are stored and
 * compared in plaintext. The two tests marked CHARACTERISES SEC-01 are
 * expected to fail when phase 3 introduces bcrypt; that failure is the
 * signal that the fix landed, and they should be rewritten then.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
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

  it("CHARACTERISES SEC-01: stores the password verbatim", async () => {
    await request(app).post("/users").send(validUser);

    const insert = issued.find((q) => /^INSERT/i.test(q.sql))!;
    expect(insert.params).toContain("correct-horse");
  });
});

describe("POST /users/login", () => {
  const storedUser = {
    id: 42,
    name: "Asha Rao",
    email: "asha@example.com",
    password: "correct-horse",
  };

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
      .send({ email: storedUser.email, password: "correct-horse" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.user.email).toBe(storedUser.email);
    expect(res.body.user).not.toHaveProperty("password");
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
      .send({ email: storedUser.email, password: "correct-horse" });

    expect(issued[0].sql).toMatch(/^SELECT .* FROM users WHERE email = \?/i);
    expect(issued[0].params).toEqual([storedUser.email]);
  });

  it("CHARACTERISES SEC-01: compares the password as plaintext", async () => {
    // A bcrypt hash of "correct-horse" must NOT authenticate today, because the
    // comparison is a string equality check against the stored value. When
    // phase 3 lands bcrypt, this expectation inverts.
    selectRows = [
      {
        ...storedUser,
        password: "$2b$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOP",
      },
    ];

    const res = await request(app)
      .post("/users/login")
      .send({ email: storedUser.email, password: "correct-horse" });

    expect(res.status).toBe(401);
  });
});
