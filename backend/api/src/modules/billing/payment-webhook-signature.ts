import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Payment-provider signature contract:
 *   x-payment-signature: t=<unix-seconds>,v1=<hex-hmac-sha256>
 * The HMAC input is `${timestamp}.` followed by the exact raw request bytes.
 * A five-minute replay window is enforced; provider-specific adapters may
 * impose a narrower window where their documented contract requires it.
 */
export function verifyPaymentWebhookSignature(
  rawBody: Buffer,
  signature: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = 300,
): boolean {
  if (!Buffer.isBuffer(rawBody) || rawBody.length > 64 * 1024) return false;
  if (typeof secret !== "string" || secret.length < 32 || typeof signature !== "string") return false;
  if (!Number.isSafeInteger(nowSeconds) || !Number.isSafeInteger(toleranceSeconds) || toleranceSeconds < 1) return false;

  const parts: Record<string, string> = {};
  for (const segment of signature.split(",")) {
    const separator = segment.indexOf("=");
    if (separator <= 0 || separator === segment.length - 1) return false;
    const key = segment.slice(0, separator).trim();
    const value = segment.slice(separator + 1).trim();
    if (!key || !value || Object.hasOwn(parts, key)) return false;
    parts[key] = value;
  }
  if (Object.keys(parts).length !== 2 || !Object.hasOwn(parts, "t") || !Object.hasOwn(parts, "v1")) return false;
  if (!/^\d{1,12}$/.test(parts.t) || !/^[a-f0-9]{64}$/i.test(parts.v1)) return false;

  const timestamp = Number(parts.t);
  if (!Number.isSafeInteger(timestamp) || Math.abs(nowSeconds - timestamp) > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.`).update(rawBody).digest();
  const supplied = Buffer.from(parts.v1, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
