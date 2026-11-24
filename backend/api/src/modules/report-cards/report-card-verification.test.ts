import { describe, expect, it } from "vitest";
import { isValidReportCardVerificationCode } from "./report-card-verification.js";

describe("report-card verification code", () => {
  it("accepts exactly 128-bit uppercase hex codes", () => {
    expect(isValidReportCardVerificationCode("A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6")).toBe(true);
  });
  it("rejects short, lowercase, non-hex and path-like input", () => {
    for (const value of ["ABC123", "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6", "G1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6", "../admin", ""]) expect(isValidReportCardVerificationCode(value)).toBe(false);
  });
});
