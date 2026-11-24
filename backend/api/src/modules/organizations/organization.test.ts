import { describe, expect, it } from "vitest";
import {
  onboardOrganizationSchema, createSchoolSchema, inviteMemberSchema, acceptInvitationSchema
} from "./organization.schemas.js";

describe("P04 organization validation", () => {
  it("normalizes organization slug and school code", () => {
    const parsed = onboardOrganizationSchema.parse({
      organizationName: "North Star Education", organizationSlug: "North-Star",
      schoolName: "North Star Public School", schoolCode: "nsp"
    });
    expect(parsed.organizationSlug).toBe("north-star");
    expect(parsed.schoolCode).toBe("NSP");
  });
  it("rejects invalid school code", () => {
    expect(createSchoolSchema.safeParse({ name: "Test School", code: "bad code" }).success).toBe(false);
  });
  it("limits invitation roles to supported role keys", () => {
    expect(inviteMemberSchema.safeParse({ email: "a@example.com", roleKey: "ROOT" }).success).toBe(false);
  });
  it("requires a high-entropy invitation token", () => {
    expect(acceptInvitationSchema.safeParse({ token: "short" }).success).toBe(false);
  });
});
