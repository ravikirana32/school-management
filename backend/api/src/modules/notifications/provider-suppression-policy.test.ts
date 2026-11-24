import { describe, expect, it } from "vitest";
import { shouldCreateProviderSuppression } from "./provider-suppression-policy.js";

describe("provider suppression versus manual release precedence", () => {
  const eventAt = new Date("2026-11-17T09:00:00.000Z");
  it("creates suppression when no prior record exists", () => expect(shouldCreateProviderSuppression(null, null, eventAt)).toBe(true));
  it("does not recreate suppression when manual release happened after event time", () => expect(shouldCreateProviderSuppression("RELEASED", new Date("2026-11-18T09:00:00.000Z"), eventAt)).toBe(false));
  it("allows a genuinely newer provider event after a manual release", () => expect(shouldCreateProviderSuppression("RELEASED", new Date("2026-11-16T09:00:00.000Z"), eventAt)).toBe(true));
  it("allows idempotent active-row handling to proceed to unique conflict check", () => expect(shouldCreateProviderSuppression("ACTIVE", null, eventAt)).toBe(true));
  it("rejects invalid event time", () => expect(shouldCreateProviderSuppression(null, null, new Date("invalid"))).toBe(false));
});
