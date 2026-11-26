import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  verifyAccessToken: vi.fn(),
  sessionFind: vi.fn(),
  userFind: vi.fn(),
  factorFind: vi.fn(),
  recoveryCount: vi.fn(),
  assignmentsFind: vi.fn()
}));
vi.mock("./tokens.js", () => ({ verifyAccessToken: mocks.verifyAccessToken, issueAccessToken: vi.fn() }));
vi.mock("../../lib/prisma.js", () => ({ prisma: {
  userSession: { findFirst: mocks.sessionFind },
  user: { findUnique: mocks.userFind },
  mfaFactor: { findFirst: mocks.factorFind },
  mfaRecoveryCode: { count: mocks.recoveryCount },
  userRoleAssignment: { findMany: mocks.assignmentsFind }
} }));
import { authRouter } from "./auth.routes.js";

const originalMfaEnabled = process.env.MFA_ENABLED;
const originalRequiredRoleKeys = process.env.MFA_REQUIRED_ROLE_KEYS;

function app() {
  const server = express();
  server.use(authRouter);
  return server;
}

describe("MFA status policy feature flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MFA_ENABLED;
    delete process.env.MFA_REQUIRED_ROLE_KEYS;
    mocks.verifyAccessToken.mockResolvedValue({ sub: "admin-1", sessionId: "session-1" });
    mocks.sessionFind.mockResolvedValue({ id: "session-1", mfaVerifiedAt: null });
    mocks.userFind.mockImplementation((args: { select?: { isActive?: boolean } }) => Promise.resolve(args.select?.isActive
      ? { isPlatformAdmin: true, isActive: true }
      : { isPlatformAdmin: true }));
    mocks.factorFind.mockResolvedValue(null);
    mocks.recoveryCount.mockResolvedValue(0);
    mocks.assignmentsFind.mockResolvedValue([]);
  });
  afterEach(() => {
    if (originalMfaEnabled === undefined) delete process.env.MFA_ENABLED;
    else process.env.MFA_ENABLED = originalMfaEnabled;
    if (originalRequiredRoleKeys === undefined) delete process.env.MFA_REQUIRED_ROLE_KEYS;
    else process.env.MFA_REQUIRED_ROLE_KEYS = originalRequiredRoleKeys;
  });

  it("reports MFA as disabled and not required when the flag is unset", async () => {
    const response = await request(app()).get("/mfa/status").set("Authorization", "Bearer access-token");
    expect(response.status).toBe(200);
    expect(response.body.data.policy).toMatchObject({
      enabled: false,
      required: false,
      reasons: [],
      challengeRequired: false,
      enrollmentRequired: false
    });
    expect(mocks.assignmentsFind).not.toHaveBeenCalled();
  });

  it("reports platform-admin MFA as required when the flag is enabled", async () => {
    process.env.MFA_ENABLED = "true";
    const response = await request(app()).get("/mfa/status").set("Authorization", "Bearer access-token");
    expect(response.status).toBe(200);
    expect(response.body.data.policy).toMatchObject({
      enabled: true,
      required: true,
      reasons: ["PLATFORM_ADMIN"],
      challengeRequired: false,
      enrollmentRequired: true
    });
    expect(mocks.assignmentsFind).toHaveBeenCalledOnce();
  });
});
