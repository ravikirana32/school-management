import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const redisMock = vi.hoisted(() => ({ counters: new Map<string, number>(), fail: false }));
vi.mock("ioredis", () => ({ default: class MockRedis {
  status = "wait";
  async connect() { this.status = "ready"; }
  async eval(_script: string, _keys: number, key: string, window: string) {
    if (redisMock.fail) throw new Error("Redis unavailable");
    const count = (redisMock.counters.get(key) || 0) + 1;
    redisMock.counters.set(key, count);
    return [count, Number(window)];
  }
  async quit() { this.status = "end"; }
} }));

import { authRateLimit } from "./auth-rate-limit.js";


function createApp() {
  const app = express();
  app.use(express.json());
  app.post("/limited", authRateLimit({ scope: "p465-test", limit: 2, windowMs: 60_000, identity: (req) => req.ip || "test-ip" }), (_req, res) => res.status(200).json({ ok: true }));
  return app;
}


describe("P465 authentication rate-limit HTTP integration", () => {
  beforeEach(() => { redisMock.counters.clear(); redisMock.fail = false; });

  it("allows requests up to the configured limit", async () => {
    const app = createApp();
    expect((await request(app).post("/limited")).status).toBe(200);
    expect((await request(app).post("/limited")).status).toBe(200);
  });

  it("returns 429 and Retry-After when the limit is exceeded", async () => {
    const app = createApp();
    await request(app).post("/limited");
    await request(app).post("/limited");
    const response = await request(app).post("/limited");
    expect(response.status).toBe(429);
    expect(response.headers["retry-after"]).toBeDefined();
    expect(response.body).toMatchObject({ error: "Too many requests. Please try again later." });
  });

  it("fails closed with 503 when Redis is unavailable", async () => {
    redisMock.fail = true;
    const response = await request(createApp()).post("/limited");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ error: "Authentication service temporarily unavailable" });
  });

  it("does not expose limiter identity values in the response", async () => {
    const response = await request(createApp()).post("/limited");
    expect(JSON.stringify(response.body)).not.toContain("test-ip");
  });
});
