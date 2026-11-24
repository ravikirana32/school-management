import { describe, expect, it } from "vitest";
import { inviteMemberSchema } from "../organizations/organization.schemas.js";

describe("P04 tenant-scope policy contract", () => {
  it("requires school scope for school roles", () => {
    expect(inviteMemberSchema.safeParse({ email: "teacher@example.com", roleKey: "TEACHER" }).success).toBe(false);
    expect(inviteMemberSchema.safeParse({ email: "teacher@example.com", roleKey: "TEACHER", schoolId: "school-1" }).success).toBe(true);
  });
  it("prevents organization admin invitation from being school-scoped", () => {
    expect(inviteMemberSchema.safeParse({ email: "admin@example.com", roleKey: "ORG_ADMIN", schoolId: "school-1" }).success).toBe(false);
  });
});
