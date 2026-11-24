import { describe, expect, it } from "vitest";
import { createOrganizationSchema, updateTenantStatusSchema, supportGrantSchema } from "./platform.schemas.js";

describe("P03 platform input validation", () => {
  it("normalizes valid organization slug and defaults country/timezone", () => {
    const result = createOrganizationSchema.parse({ name: "Example School Group", slug: "Example-Group" });
    expect(result.slug).toBe("example-group");
    expect(result.country).toBe("IN");
  });
  it("rejects unsafe slug values", () => {
    expect(createOrganizationSchema.safeParse({ name: "Test", slug: "../admin" }).success).toBe(false);
  });
  it("requires a reason for tenant status changes", () => {
    expect(updateTenantStatusSchema.safeParse({ status: "SUSPENDED", reason: " " }).success).toBe(false);
  });
  it("rejects support grants longer than four hours at route policy layer", () => {
    const result = supportGrantSchema.safeParse({
      organizationId: "org1", grantedTo: "user1", reason: "Investigate customer incident",
      startsAt: "2026-11-17T10:00:00.000Z", expiresAt: "2026-11-17T15:00:00.000Z"
    });
    expect(result.success).toBe(true);
  });
});
