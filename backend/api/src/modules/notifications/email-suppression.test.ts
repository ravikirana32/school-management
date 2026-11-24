import { describe, expect, it } from "vitest";
import { getSuppressionHashKeys, hashSuppressionEmail, normalizeEmailAddress } from "./email-suppression.js";

describe("tenant email suppression hashing", () => {
  const key = "stable-secret-key-with-at-least-32-chars";
  it("normalizes case and whitespace", () => expect(hashSuppressionEmail(" Parent@Example.com ", key)).toBe(hashSuppressionEmail("parent@example.com", key)));
  it("uses keyed hashes rather than storing plaintext", () => expect(hashSuppressionEmail("parent@example.com", key)).not.toBe(normalizeEmailAddress("parent@example.com")));
  it("isolates hashes by secret", () => expect(hashSuppressionEmail("parent@example.com", key)).not.toBe(hashSuppressionEmail("parent@example.com", key + "2")));
  it("rejects malformed email", () => expect(() => hashSuppressionEmail("not-an-email", key)).toThrow());
  it("uses current key first and keeps previous key for legacy rows", () => {
    expect(getSuppressionHashKeys({ currentSecret: "current-secret-with-at-least-32-characters", currentVersion: "v2", previousSecret: key, previousVersion: "v1" })).toEqual([
      { version: "v2", secret: "current-secret-with-at-least-32-characters" }, { version: "v1", secret: key },
    ]);
  });
  it("supports legacy secret as current during migration", () => {
    expect(getSuppressionHashKeys({ currentVersion: "v1", legacySecret: key })).toEqual([{ version: "v1", secret: key }]);
  });
  it("fails closed when current key is absent", () => expect(() => getSuppressionHashKeys({ currentVersion: "v2" })).toThrow());
  it("rejects a previous secret without a version", () => expect(() => getSuppressionHashKeys({ currentSecret: key, currentVersion: "v2", previousSecret: key })).toThrow());
  it("rejects a previous version without a secret", () => expect(() => getSuppressionHashKeys({ currentSecret: key, currentVersion: "v2", previousVersion: "v1" })).toThrow());
  it("rejects duplicate current and previous versions", () => expect(() => getSuppressionHashKeys({ currentSecret: key, currentVersion: "v1", previousSecret: key + "2", previousVersion: "v1" })).toThrow());
});
