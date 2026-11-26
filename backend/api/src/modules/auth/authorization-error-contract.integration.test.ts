import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  verifyAccessToken: vi.fn(), sessionFind: vi.fn(), userFind: vi.fn(), roleFind: vi.fn(), factorFind: vi.fn()
}));
vi.mock("./tokens.js", () => ({ verifyAccessToken: mocks.verifyAccessToken }));
vi.mock("../../lib/prisma.js", () => ({ prisma: {
  userSession: { findFirst: mocks.sessionFind }, user: { findUnique: mocks.userFind },
  userRoleAssignment: { findFirst: mocks.roleFind }, mfaFactor: { findFirst: mocks.factorFind }
} }));
import { authenticate } from "./auth.middleware.js";

const originalMfaEnabled = process.env.MFA_ENABLED;

function app() {
  const server = express();
  server.get("/protected", authenticate, (_req, res) => res.status(200).json({ ok: true }));
  return server;
}

describe("P470 authentication/authorization error contract integration foundation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MFA_ENABLED = "true";
    mocks.verifyAccessToken.mockResolvedValue({ sub: "user-1", sessionId: "session-1" });
    mocks.sessionFind.mockResolvedValue({ id: "session-1", mfaVerifiedAt: new Date() });
    mocks.userFind.mockResolvedValue({ isPlatformAdmin: false, isActive: true });
    mocks.roleFind.mockResolvedValue(null);
    mocks.factorFind.mockResolvedValue({ id: "factor-1" });
    delete process.env.MFA_REQUIRED_ROLE_KEYS;
  });
  afterEach(() => {
    if (originalMfaEnabled === undefined) delete process.env.MFA_ENABLED;
    else process.env.MFA_ENABLED = originalMfaEnabled;
  });
  it.each([
    ["unset", undefined],
    ["false", "false"]
  ])("does not enforce MFA when the feature flag is %s", async (_label, enabled) => {
    if (enabled === undefined) delete process.env.MFA_ENABLED;
    else process.env.MFA_ENABLED = enabled;
    mocks.userFind.mockResolvedValueOnce({ isPlatformAdmin: true, isActive: true });
    const response = await request(app()).get("/protected").set("Authorization", "Bearer token");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(mocks.factorFind).not.toHaveBeenCalled();
  });
  it("returns 401 with the stable authentication-required contract when bearer token is absent", async () => {
    const response = await request(app()).get("/protected");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
    expect(mocks.verifyAccessToken).not.toHaveBeenCalled();
  });
  it("returns the same 401 contract for an invalid token", async () => {
    mocks.verifyAccessToken.mockRejectedValueOnce(new Error("invalid token"));
    const response = await request(app()).get("/protected").set("Authorization", "Bearer invalid");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });
  it("returns 401 when session is not active", async () => {
    mocks.sessionFind.mockResolvedValueOnce(null);
    const response = await request(app()).get("/protected").set("Authorization", "Bearer token");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });
  it("returns 401 for inactive account without disclosing account state", async () => {
    mocks.userFind.mockResolvedValueOnce({ isPlatformAdmin: false, isActive: false });
    const response = await request(app()).get("/protected").set("Authorization", "Bearer token");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });
  it("returns a structured 403 MFA enrollment-required contract", async () => {
    mocks.userFind.mockResolvedValueOnce({ isPlatformAdmin: true, isActive: true });
    mocks.factorFind.mockResolvedValueOnce(null);
    const response = await request(app()).get("/protected").set("Authorization", "Bearer token");
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Multi-factor authentication enrollment is required", code: "MFA_ENROLLMENT_REQUIRED", action: { method: "POST", endpoint: "/api/v1/auth/mfa/totp/enroll" } });
  });
  it("returns a structured 403 MFA challenge-required contract when verification is stale", async () => {
    mocks.userFind.mockResolvedValueOnce({ isPlatformAdmin: true, isActive: true });
    mocks.factorFind.mockResolvedValueOnce({ id: "factor-1" });
    mocks.sessionFind.mockResolvedValueOnce({ id: "session-1", mfaVerifiedAt: new Date(Date.now() - 6 * 60 * 1000) });
    const response = await request(app()).get("/protected").set("Authorization", "Bearer token");
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Fresh multi-factor authentication verification is required", code: "MFA_CHALLENGE_REQUIRED", action: { method: "POST", endpoint: "/api/v1/auth/mfa/verify" }, freshnessSeconds: 300 });
  });
  it("passes authenticated requests through when MFA freshness is valid", async () => {
    mocks.userFind.mockResolvedValueOnce({ isPlatformAdmin: true, isActive: true });
    const response = await request(app()).get("/protected").set("Authorization", "Bearer token");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
