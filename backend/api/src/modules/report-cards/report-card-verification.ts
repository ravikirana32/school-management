/** Verification codes are random 128-bit values encoded as uppercase hexadecimal. */
export function isValidReportCardVerificationCode(value: string): boolean {
  return /^[A-F0-9]{32}$/.test(value);
}
