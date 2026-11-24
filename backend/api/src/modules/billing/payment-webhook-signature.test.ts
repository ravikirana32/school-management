import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { verifyPaymentWebhookSignature } from "./payment-webhook-signature.js";

describe("payment webhook timestamped signature", () => {
  const secret = "p576-test-secret-with-at-least-32-characters";
  const raw = Buffer.from('{"id":"evt_576","type":"payment.succeeded"}');
  const now = 1_800_000_000;
  const sign = (timestamp: number, body = raw) =>
    `t=${timestamp},v1=${createHmac("sha256", secret).update(`${timestamp}.`).update(body).digest("hex")}`;

  it("accepts a valid signature over the exact raw body", () =>
    expect(verifyPaymentWebhookSignature(raw, sign(now), secret, now)).toBe(true));
  it("rejects a changed body", () =>
    expect(verifyPaymentWebhookSignature(Buffer.from("{}"), sign(now), secret, now)).toBe(false));
  it("rejects timestamps outside the replay window in either direction", () => {
    expect(verifyPaymentWebhookSignature(raw, sign(now - 301), secret, now)).toBe(false);
    expect(verifyPaymentWebhookSignature(raw, sign(now + 301), secret, now)).toBe(false);
  });
  it("rejects malformed, duplicate and unknown header fields", () => {
    expect(verifyPaymentWebhookSignature(raw, "v1=bad", secret, now)).toBe(false);
    expect(verifyPaymentWebhookSignature(raw, `${sign(now)},t=${now}`, secret, now)).toBe(false);
    expect(verifyPaymentWebhookSignature(raw, `${sign(now)},v2=abc`, secret, now)).toBe(false);
  });
  it("rejects non-decimal timestamps and malformed digests", () => {
    expect(verifyPaymentWebhookSignature(raw, sign(now).replace(`t=${now}`, "t=1e9"), secret, now)).toBe(false);
    expect(verifyPaymentWebhookSignature(raw, `t=${now},v1=xyz`, secret, now)).toBe(false);
  });
  it("rejects short secrets and oversized bodies", () => {
    expect(verifyPaymentWebhookSignature(raw, sign(now), "short", now)).toBe(false);
    expect(verifyPaymentWebhookSignature(Buffer.alloc(65 * 1024), sign(now), secret, now)).toBe(false);
  });
  it("rejects an invalid tolerance", () =>
    expect(verifyPaymentWebhookSignature(raw, sign(now), secret, now, 0)).toBe(false));
});
