import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function encryptionKey(): Buffer {
  const value = process.env.MFA_ENCRYPTION_KEY;
  if (!value) throw new Error("MFA_ENCRYPTION_KEY is required for MFA operations");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("MFA_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  return key;
}

export function encryptMfaSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptMfaSecret(value: string): string {
  const [ivPart, tagPart, dataPart] = value.split(".");
  if (!ivPart || !tagPart || !dataPart) throw new Error("Invalid encrypted MFA secret");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataPart, "base64url")), decipher.final()]).toString("utf8");
}

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function encodeBase32(input: Buffer): string {
  let bits = 0, value = 0, output = "";
  for (const byte of input) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { output += BASE32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];
  return output;
}
function decodeBase32(input: string): Buffer {
  let bits = 0, value = 0; const bytes: number[] = [];
  for (const char of input.replace(/=+$/g, "").toUpperCase()) {
    const index = BASE32.indexOf(char); if (index < 0) throw new Error("Invalid base32 secret");
    value = (value << 5) | index; bits += 5;
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(bytes);
}
export function validTotpStep(secret: string, code: string, now = Date.now()): bigint | null {
  if (!/^\d{6}$/.test(code)) return null;
  const key = decodeBase32(secret);
  const counter = Math.floor(now / 30000);
  for (let drift = -1; drift <= 1; drift++) {
    const step = counter + drift;
    const buffer = Buffer.alloc(8); buffer.writeBigUInt64BE(BigInt(step));
    const digest = createHmac("sha1", key).update(buffer).digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const binary = ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff);
    const expected = String(binary % 1_000_000).padStart(6, "0");
    const a = Buffer.from(expected), b = Buffer.from(code);
    if (timingSafeEqual(a, b)) return BigInt(step);
  }
  return null;
}
export function verifyTotp(secret: string, code: string, now = Date.now()): boolean {
  return validTotpStep(secret, code, now) !== null;
}
export function newTotpSecret(): string { return encodeBase32(randomBytes(20)); }
export function newRecoveryCode(): string { return randomBytes(10).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-"); }
export function hashRecoveryCode(code: string): string { return createHash("sha256").update(code.replace(/-/g, "").toUpperCase()).digest("hex"); }
