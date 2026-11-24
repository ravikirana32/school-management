import { timingSafeEqual } from "node:crypto";

/** Compare fixed-size SHA-256 hex digests without data-dependent byte comparison.
 * Malformed persisted hashes fail closed; no exception escapes the verifier.
 */
export function timingSafeHashEqual(leftHex: string, rightHex: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(leftHex) || !/^[a-f0-9]{64}$/i.test(rightHex)) return false;
  const left = Buffer.from(leftHex, "hex");
  const right = Buffer.from(rightHex, "hex");
  if (left.length !== 32 || right.length !== 32) return false;
  return timingSafeEqual(left, right);
}
