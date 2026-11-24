import { describe, expect, it } from "vitest";
import { hasPermission, assertScope } from "./permissions.js";
import { hashOpaqueToken, createOpaqueToken } from "./security.js";

describe("P02 authorization primitives", () => {
  it("matches exact and module wildcard permissions", () => {
    const ctx = { userId: "u1", permissions: new Set(["students.*"]) };
    expect(hasPermission(ctx, "students.read")).toBe(true);
    expect(hasPermission(ctx, "fees.read")).toBe(false);
  });
  it("rejects cross-organization scope", () => {
    const ctx = { userId: "u1", organizationId: "org-a", permissions: new Set<string>() };
    expect(() => assertScope(ctx, { organizationId: "org-b" })).toThrow("Organization scope mismatch");
  });
  it("creates opaque tokens and one-way hashes", () => {
    const token = createOpaqueToken();
    expect(token.length).toBeGreaterThan(32);
    expect(hashOpaqueToken(token)).not.toBe(token);
  });
});
