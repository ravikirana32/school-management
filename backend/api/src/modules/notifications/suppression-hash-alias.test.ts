import { describe, expect, it } from "vitest";
import { getSuppressionHashKeys } from "./email-suppression.js";
import { computeSuppressionHashAliases, hasActiveSuppressionHashAlias } from "./suppression-hash-alias.js";
import { toNotificationDeliveryEventType } from "./notification-webhook-contract.js";
import { shouldApplyNotificationDeliveryEvent } from "./notification-event-reconciliation.js";
import { shouldCreateProviderSuppression } from "./provider-suppression-policy.js";

describe("cross-layer suppression key rotation lifecycle", () => {
  const keys = getSuppressionHashKeys({ currentSecret: "current-key-secret-at-least-32-characters", currentVersion: "v2", previousSecret: "previous-key-secret-at-least-32-characters", previousVersion: "v1" });
  const email = "Parent@Example.com";
  const aliases = computeSuppressionHashAliases(email, keys);

  it("creates aliases for current and previous keys without plaintext", () => {
    expect(aliases.map(alias => alias.hashVersion)).toEqual(["v2", "v1"]);
    expect(aliases.every(alias => alias.emailHash.length === 64)).toBe(true);
    expect(JSON.stringify(aliases)).not.toContain("parent@example.com");
  });
  it("blocks delivery when any configured key alias is active", () => {
    expect(hasActiveSuppressionHashAlias(aliases, [{ ...aliases[1], status: "ACTIVE" }])).toBe(true);
    expect(hasActiveSuppressionHashAlias(aliases, [{ ...aliases[1], status: "RELEASED" }])).toBe(false);
  });
  it("maps bounce and complaint to terminal delivery states", () => {
    expect(toNotificationDeliveryEventType("email.bounced")).toBe("BOUNCED");
    expect(toNotificationDeliveryEventType("email.complained")).toBe("COMPLAINED");
    expect(shouldApplyNotificationDeliveryEvent("DELIVERED", null, "BOUNCED", new Date("2026-11-17T10:00:00Z"))).toBe(true);
  });
  it("prevents delayed provider event from undoing a later manual release", () => {
    expect(shouldCreateProviderSuppression("RELEASED", new Date("2026-11-18T10:00:00Z"), new Date("2026-11-17T10:00:00Z"))).toBe(false);
  });
});
