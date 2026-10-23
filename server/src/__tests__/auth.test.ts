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
import { app, loginLimiterStore, signupLimiterStore } from "../server";

/** Rows the fake database will return for the next SELECT. */
let selectRows: Record<string, unknown>[] = [];
/** Error the fake database will raise, if any. */
let queryError: Error | null = null;
/** Error the fake database will raise for INSERTs only, if any. */
let insertError: (Error & { code?: string; sql?: string }) | null = null;
/** Every (sql, params) pair the app issued. */
let issued: Array<{ sql: string; params: unknown[] }> = [];

vi.mock("../db/connection", () => ({
  default: {
    query: (sql: string, params: unknown[], cb: Function) => {
      issued.push({ sql, params });
      if (queryError) return cb(queryError, null);
      if (/^\s*SELECT/i.test(sql)) return cb(null, selectRows);
      if (insertError) return cb(insertError, null);
      return cb(null, { insertId: 42, affectedRows: 1 });
    },
  },
}));

beforeEach(async () => {
  selectRows = [];
  queryError = null;
  insertError = null;
  issued = [];
  await loginLimiterStore.resetAll();
  await signupLimiterStore.resetAll();
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
    expect(res.body.error).toBe("Invalid email or password.");
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

  it("answers an unknown email exactly like a wrong password (SEC-09)", async () => {
    selectRows = [{ ...storedUser }];
    const wrong = await request(app)
      .post("/users/login")
      .send({ email: storedUser.email, password: "wrong-password" });

    selectRows = [];
    const compare = vi.spyOn(bcrypt, "compare");
    const unknown = await request(app)
      .post("/users/login")
      .send({ email: "nobody@example.com", password: "wrong-password" });

    expect(unknown.status).toBe(401);
    expect(unknown.body).toEqual(wrong.body);
    // A bcrypt compare still runs, so response time does not reveal the account.
    expect(compare).toHaveBeenCalledTimes(1);
    compare.mockRestore();
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

describe("non-string fields (SEC-03: mysql2 expands objects into SQL)", () => {
  it.each([
    ["an object email", { email: { email: 1 }, password: "guess" }],
    ["an array email", { email: ["a@x.com", "b@x.com"], password: "guess" }],
    ["an object password", { email: "asha@example.com", password: { a: 1 } }],
    ["a missing email", { password: "guess" }],
  ])("rejects a login with %s before querying", async (_label, body) => {
    const res = await request(app).post("/users/login").send(body);

    expect(res.status).toBe(400);
    expect(issued).toHaveLength(0);
  });

  it.each(["name", "email", "password", "dob", "gender"])(
    "rejects a signup whose %s is not a string",
    async (field) => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUser, [field]: { [field]: 1 } });

      expect(res.status).toBe(400);
      expect(issued).toHaveLength(0);
    }
  );
});

describe("server-side signup validation (SEC-08)", () => {
  it.each([
    ["a password under 6 characters", { password: "12345" }, /password/i],
    ["an email with no domain", { email: "not-an-email" }, /email/i],
    ["an email over 254 characters", { email: `${"a".repeat(250)}@x.com` }, /email/i],
    ["an unknown gender", { gender: "Robot" }, /gender/i],
    ["a dob not in YYYY-MM-DD form", { dob: "12/04/1995" }, /date of birth/i],
    ["a dob that is not a real date", { dob: "1995-02-30" }, /date of birth/i],
    ["a dob in the future", { dob: "2999-01-01" }, /date of birth/i],
    ["a name over 255 characters", { name: "a".repeat(256) }, /name/i],
    ["a blank name", { name: "   " }, /name/i],
  ])("rejects %s with 400 before querying", async (_label, override, message) => {
    const res = await request(app).post("/users").send({ ...validUser, ...override });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(message);
    expect(issued).toHaveLength(0);
  });
});

describe("CORS (SEC-12)", () => {
  it("does not grant an unknown origin cross-origin access", async () => {
    const res = await request(app)
      .post("/users/login")
      .set("Origin", "https://evil.example")
      .send({ email: "a@b.co", password: "whatever" });

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("allows the configured frontend origin", async () => {
    const res = await request(app)
      .options("/users/login")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });
});

describe("error logging (SEC-13)", () => {
  it("never logs the SQL text mysql2 attaches to errors", async () => {
    insertError = Object.assign(new Error("Data too long for column"), {
      code: "ER_DATA_TOO_LONG",
      sql: "INSERT INTO users VALUES ('Asha Rao', 'asha@example.com', '$2a$10$hashhash')",
    });
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await request(app).post("/users").send(validUser);

    const output = logged.mock.calls
      .flat()
      .map((arg) =>
        typeof arg === "string" ? arg : JSON.stringify(arg, Object.getOwnPropertyNames(arg ?? {}))
      )
      .join("\n");
    logged.mockRestore();
    expect(res.status).toBe(500);
    expect(output).not.toContain("asha@example.com");
    expect(output).not.toContain("$2a$10$");
  });
});

describe("concurrent duplicate signup (SEC-14)", () => {
  it("maps a unique-key violation on INSERT to 409, not 500", async () => {
    insertError = Object.assign(new Error("Duplicate entry"), { code: "ER_DUP_ENTRY" });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await request(app).post("/users").send(validUser);

    vi.mocked(console.error).mockRestore();
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("User already exists.");
  });
});

describe("fingerprinting headers (SEC-15)", () => {
  it("does not advertise Express", async () => {
    const res = await request(app).post("/users/login").send({});

    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("rate limiting (SEC-06)", () => {
  it("blocks an IP after 10 failed logins in the window", async () => {
    selectRows = [
      { id: 1, email: "asha@example.com", password: await bcrypt.hash("right", 4) },
    ];
    const attempt = () =>
      request(app).post("/users/login").send({ email: "asha@example.com", password: "wrong" });

    for (let i = 0; i < 10; i++) expect((await attempt()).status).toBe(401);

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/too many/i);
  });

  it("does not count successful logins against the limit", async () => {
    selectRows = [
      { id: 1, email: "asha@example.com", password: await bcrypt.hash("right", 4) },
    ];
    const login = () =>
      request(app).post("/users/login").send({ email: "asha@example.com", password: "right" });

    for (let i = 0; i < 12; i++) expect((await login()).status).toBe(200);
  });

  it("blocks an IP after 5 signups in the window", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/users")
        .send({ ...validUser, email: `user${i}@example.com` });
      expect(res.status).toBe(201);
    }

    const blocked = await request(app).post("/users").send(validUser);
    expect(blocked.status).toBe(429);
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
