import { describe, expect, it } from "vitest";
import { hasGuardianContactMatch, normalizeGuardianEmail, normalizeGuardianPhone } from "./guardian-identity.js";

describe("guardian identity duplicate review", () => {
  it("normalizes email case and whitespace", () => expect(normalizeGuardianEmail(" Parent@Example.COM ")).toBe("parent@example.com"));
  it("normalizes phone punctuation without guessing country codes", () => expect(normalizeGuardianPhone("+91 98765-43210")).toBe("+919876543210"));
  it("detects exact normalized contact matches", () => expect(hasGuardianContactMatch({ email: "PARENT@example.com" }, { email: "parent@example.com" })).toBe(true));
  it("does not treat a partial phone suffix as a duplicate", () => expect(hasGuardianContactMatch({ phone: "9876543210" }, { phone: "19876543210" })).toBe(false));
  it("does not match when no usable contact key exists", () => expect(hasGuardianContactMatch({}, { email: "parent@example.com" })).toBe(false));
});
