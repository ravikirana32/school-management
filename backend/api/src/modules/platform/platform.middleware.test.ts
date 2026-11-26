import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const mocks = vi.hoisted(() => ({ userFind: vi.fn(), factorFind: vi.fn() }));
vi.mock("../../lib/prisma.js", () => ({ prisma: {
  user: { findUnique: mocks.userFind },
  mfaFactor: { findFirst: mocks.factorFind }
} }));
import { requirePlatformAdmin } from "./platform.middleware.js";

const originalMfaEnabled = process.env.MFA_ENABLED;

function app() {
  const server = express();
  server.use((req, _res, next) => {
    req.auth = { userId: "admin-1", sessionId: "session-1", isPlatformAdmin: true, mfaVerifiedAt: null };
    next();
  });
  server.get("/platform", requirePlatformAdmin, (_req, res) => res.status(200).json({ ok: true }));
  return server;
}

describe("platform-admin MFA feature flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userFind.mockResolvedValue({ isPlatformAdmin: true, isActive: true });
    mocks.factorFind.mockResolvedValue(null);
  });
  afterEach(() => {
    if (originalMfaEnabled === undefined) delete process.env.MFA_ENABLED;
    else process.env.MFA_ENABLED = originalMfaEnabled;
  });

  it("allows platform access without an MFA factor when enforcement is disabled", async () => {
    process.env.MFA_ENABLED = "false";
    const response = await request(app()).get("/platform");
    expect(response.status).toBe(200);
    expect(mocks.factorFind).not.toHaveBeenCalled();
  });

  it("requires enrollment when enforcement is enabled", async () => {
    process.env.MFA_ENABLED = "true";
    const response = await request(app()).get("/platform");
    expect(response.status).toBe(403);
    expect(response.body.error).toContain("requires enrolled MFA");
    expect(mocks.factorFind).toHaveBeenCalledOnce();
  });
});
