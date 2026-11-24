import { describe, expect, it } from "vitest";
import { hasPermission, assertScope, type AuthorizationContext } from "./permissions.js";

// Synthetic authorization fixtures: no production DB or route handler is exercised here.
const schoolAdmin: AuthorizationContext = {
  userId: "school-admin-1", organizationId: "org-a", schoolId: "school-a",
  permissions: new Set(["students.*", "attendance.read", "school.settings.manage"])
};
const teacher: AuthorizationContext = {
  userId: "teacher-1", organizationId: "org-a", schoolId: "school-a",
  permissions: new Set(["attendance.*", "students.read"])
};
const parent: AuthorizationContext = {
  userId: "parent-1", organizationId: "org-a", schoolId: "school-a",
  permissions: new Set(["students.read"])
};
const platformAdmin: AuthorizationContext = {
  userId: "platform-admin-1", permissions: new Set(), isPlatformAdmin: true
};

describe("P466 authorization boundary contract", () => {
  it("allows an exact permission", () => expect(hasPermission(teacher, "students.read")).toBe(true));
  it("denies a permission absent from the role", () => expect(hasPermission(parent, "students.update")).toBe(false));
  it("allows module wildcard permissions within their module", () => expect(hasPermission(teacher, "attendance.manage")).toBe(true));
  it("does not let module wildcards cross modules", () => expect(hasPermission(teacher, "fees.read")).toBe(false));
  it("allows global wildcard permissions", () => expect(hasPermission({ ...parent, permissions: new Set(["*"]) , isPlatformAdmin: false}, "fees.manage")).toBe(true));
  it("allows platform administrators regardless of explicit permissions", () => expect(hasPermission(platformAdmin, "fees.manage")).toBe(true));
  it("accepts matching organization and school scopes", () => expect(() => assertScope(teacher, { organizationId: "org-a", schoolId: "school-a" })).not.toThrow());
  it("rejects cross-organization access", () => expect(() => assertScope(teacher, { organizationId: "org-b" })).toThrow("Organization scope mismatch"));
  it("rejects cross-school access", () => expect(() => assertScope(teacher, { schoolId: "school-b" })).toThrow("School scope mismatch"));
  it("requires a school context when a school scope is requested", () => expect(() => assertScope({ userId: "u", permissions: new Set() }, { schoolId: "school-a" })).toThrow("School scope is required"));
  it("allows platform admins to bypass scope comparisons", () => expect(() => assertScope(platformAdmin, { organizationId: "org-b", schoolId: "school-b" })).not.toThrow());
  it("keeps school admin permission bounded by the supplied set unless admin flag is set", () => expect(hasPermission(schoolAdmin, "fees.manage")).toBe(false));
});
