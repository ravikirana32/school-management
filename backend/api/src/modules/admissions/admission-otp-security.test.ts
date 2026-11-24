import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { timingSafeHashEqual } from "./admission-otp-security.js";

const digest=(value:string)=>createHash("sha256").update(value).digest("hex");

describe("admission OTP hash comparison",()=>{
  it("accepts identical fixed-length SHA-256 hashes",()=>{const h=digest("challenge:123456");expect(timingSafeHashEqual(h,h)).toBe(true);});
  it("rejects mismatched hashes",()=>{expect(timingSafeHashEqual(digest("challenge:123456"),digest("challenge:654321"))).toBe(false);});
  it("fails closed for malformed or wrong-length persisted hashes",()=>{const valid=digest("valid");expect(timingSafeHashEqual("not-a-hash",valid)).toBe(false);expect(timingSafeHashEqual("0".repeat(63),valid)).toBe(false);expect(timingSafeHashEqual("g".repeat(64),valid)).toBe(false);});
});
