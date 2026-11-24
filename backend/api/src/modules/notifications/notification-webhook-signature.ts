import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyNotificationWebhookSignature(rawBody: Buffer, signature: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!Buffer.isBuffer(rawBody) || !secret || secret.length < 32 || typeof signature !== "string") return false;
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
  if (!Number.isSafeInteger(timestamp) || Math.abs(nowSeconds - timestamp) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.`).update(rawBody).digest();
  const supplied = Buffer.from(parts.v1, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
