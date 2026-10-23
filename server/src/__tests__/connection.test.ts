/**
 * Tests for the database handle in db/connection.ts. mysql2 is mocked, so no
 * database is needed.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mysql = vi.hoisted(() => ({
  createPool: vi.fn(() => ({ on: vi.fn(), query: vi.fn() })),
  createConnection: vi.fn(() => ({ on: vi.fn(), query: vi.fn() })),
}));
vi.mock("mysql2", () => ({ default: mysql }));

const dbEnv = { DB_HOST: "db.internal", DB_USER: "app", DB_PASSWORD: "pw", DB_NAME: "fincast" };

beforeEach(() => {
  vi.resetModules();
  mysql.createPool.mockClear();
  mysql.createConnection.mockClear();
  for (const [key, value] of Object.entries(dbEnv)) vi.stubEnv(key, value);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("db/connection", () => {
  it("uses a pool, which replaces connections MySQL drops (BUG-03)", async () => {
    await import("../db/connection");

    expect(mysql.createConnection).not.toHaveBeenCalled();
    expect(mysql.createPool).toHaveBeenCalledTimes(1);
    expect(mysql.createPool.mock.calls[0]).toEqual([
      expect.objectContaining({ host: "db.internal", database: "fincast" }),
    ]);
  });

  it("formats object placeholder values as strings, not SQL (SEC-03)", async () => {
    await import("../db/connection");

    const options = (mysql.createPool.mock.calls[0] as unknown[])[0];
    expect(options).toMatchObject({ stringifyObjects: true });
  });

  it("refuses to start without the required variables", async () => {
    vi.stubEnv("DB_PASSWORD", "");

    await expect(import("../db/connection")).rejects.toThrow(/DB_PASSWORD/);
  });
});
