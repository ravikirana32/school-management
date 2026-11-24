import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "../../config/env.js";

function encryptionKey() {
  if (!env.PLATFORM_SECRET_ENCRYPTION_KEY) {
    throw Object.assign(new Error("PLATFORM_SECRET_ENCRYPTION_KEY is not configured"), { status: 503 });
  }
  return createHash("sha256").update(env.PLATFORM_SECRET_ENCRYPTION_KEY, "utf8").digest();
}

export function encryptPlatformSecret(plaintext: string) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    nonce: nonce.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    keyVersion: "v1"
  };
}

/** Server-only accessor. Never expose this function through an HTTP response. */
export function decryptPlatformSecret(record: { ciphertext: string; nonce: string; authTag: string }) {
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(record.nonce, "base64"));
  decipher.setAuthTag(Buffer.from(record.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(record.ciphertext, "base64")),
    decipher.final()
  ]).toString("utf8");
}
