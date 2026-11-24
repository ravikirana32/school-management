import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  membership: vi.fn(), permission: vi.fn(), queryRaw: vi.fn(),
  tenant: vi.fn(), executeRaw: vi.fn(), auditCreate: vi.fn()
}));
vi.mock("../../lib/prisma.js", () => ({ prisma: { $transaction: vi.fn(), schoolMembership: {}, auditLog: {} } }));
vi.mock("../auth/auth.middleware.js", () => ({ authenticate: (req: any, _res: any, next: any) => { req.auth = { userId: "user-alpha" }; next(); } }));
vi.mock("../auth/tenant-context.js", () => ({ withTenantContext: mocks.tenant }));
vi.mock("./school-config.authorization.js", () => ({ hasActiveSchoolMembership: mocks.membership }));
vi.mock("../auth/school-permissions.js", () => ({ hasSchoolPermission: mocks.permission }));

import { schoolConfigRouter } from "./school-config.routes.js";

const app = express(); app.use(express.json()); app.use("/school-config", schoolConfigRouter);

describe("school-config protected route authorization integration foundation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.membership.mockResolvedValue(true);
    mocks.permission.mockResolvedValue(true);
    mocks.queryRaw.mockResolvedValue([]);
    mocks.executeRaw.mockResolvedValue(1);
    mocks.tenant.mockImplementation((_prisma: any, _scope: any, work: (tx: any) => any) => work({ $queryRaw: mocks.queryRaw, $executeRaw: mocks.executeRaw, auditLog: { create: mocks.auditCreate } }));
  });

  const url = "/school-config/org-alpha/school-alpha/campus-registry";
  it("returns 403 before tenant query when active school membership is absent", async () => {
    mocks.membership.mockResolvedValue(false);
    const response = await request(app).get(url);
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Active school membership required");
    expect(mocks.permission).not.toHaveBeenCalled();
    expect(mocks.tenant).not.toHaveBeenCalled();
  });
  it("returns 403 when membership exists but school permission is absent", async () => {
    mocks.permission.mockResolvedValue(false);
    const response = await request(app).get(url);
    expect(response.status).toBe(403);
    expect(response.body.error).toContain("school.settings.manage");
    expect(mocks.tenant).not.toHaveBeenCalled();
  });
  it("uses organization, school, and authenticated user scope for an authorized read", async () => {
    const response = await request(app).get(url);
    expect(response.status).toBe(200);
    expect(mocks.membership).toHaveBeenCalledWith("user-alpha", "org-alpha", "school-alpha");
    expect(mocks.permission).toHaveBeenCalledWith("user-alpha", "org-alpha", "school-alpha", "school.settings.manage");
    expect(mocks.tenant).toHaveBeenCalledWith(expect.anything(), { organizationId: "org-alpha", schoolId: "school-alpha", userId: "user-alpha" }, expect.any(Function));
    expect(mocks.queryRaw).toHaveBeenCalledTimes(1);
  });
  it("keeps request path tenant identifiers passed to membership and permission checks", async () => {
    await request(app).get("/school-config/org-beta/school-beta/campus-registry");
    expect(mocks.membership).toHaveBeenCalledWith("user-alpha", "org-beta", "school-beta");
    expect(mocks.permission).toHaveBeenCalledWith("user-alpha", "org-beta", "school-beta", "school.settings.manage");
  });
});
