import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { verifyNotificationWebhookSignature } from "./notification-webhook-signature.js";

describe("notification webhook signature", () => {
  const secret = "test-secret-with-at-least-32-characters";
  const raw = Buffer.from('{"id":"evt_1"}');
  const now = 1_800_000_000;
  const signature = (timestamp: number) => `t=${timestamp},v1=${createHmac("sha256", secret).update(`${timestamp}.`).update(raw).digest("hex")}`;
  it("accepts a valid signature over the exact raw body", () => expect(verifyNotificationWebhookSignature(raw, signature(now), secret, now)).toBe(true));
  it("rejects a modified body", () => expect(verifyNotificationWebhookSignature(Buffer.from("{}"), signature(now), secret, now)).toBe(false));
  it("rejects expired timestamps", () => expect(verifyNotificationWebhookSignature(raw, signature(now - 301), secret, now)).toBe(false));
  it("rejects malformed signature headers", () => expect(verifyNotificationWebhookSignature(raw, "v1=bad", secret, now)).toBe(false));
  it("rejects duplicate timestamp fields", () => expect(verifyNotificationWebhookSignature(raw, `${signature(now)},t=${now}`, secret, now)).toBe(false));
  it("rejects unknown signature fields", () => expect(verifyNotificationWebhookSignature(raw, `${signature(now)},v2=abcd`, secret, now)).toBe(false));
  it("rejects non-decimal timestamp encodings", () => expect(verifyNotificationWebhookSignature(raw, signature(now).replace(`t=${now}`, "t=1e9"), secret, now)).toBe(false));
  it("rejects short secrets", () => expect(verifyNotificationWebhookSignature(raw, signature(now), "short", now)).toBe(false));
});
