/** P513 fee concession calculations. Amounts are rounded to currency cents. */
export function calculateFeeConcession({ grossAmount, type, value, approvedExisting = 0 }) {
  const gross = Number(grossAmount);
  const existing = Number(approvedExisting);
  const input = Number(value);
  if (!Number.isFinite(gross) || gross <= 0 || !Number.isFinite(existing) || existing < 0 || existing > gross || !Number.isFinite(input) || input <= 0) {
    return { valid: false, reason: "INVALID_INPUT", amount: 0, remaining: Math.max(0, gross - existing) };
  }
  if (type === "PERCENTAGE" && input > 100) return { valid: false, reason: "INVALID_PERCENTAGE", amount: 0, remaining: Math.max(0, gross - existing) };
  if (type !== "FIXED" && type !== "PERCENTAGE") return { valid: false, reason: "INVALID_TYPE", amount: 0, remaining: Math.max(0, gross - existing) };
  const calculated = Math.round((type === "PERCENTAGE" ? gross * input / 100 : input) * 100) / 100;
  const remaining = Math.round((gross - existing) * 100) / 100;
  if (calculated <= 0) return { valid: false, reason: "ZERO_AFTER_ROUNDING", amount: calculated, remaining };
  if (calculated > remaining) return { valid: false, reason: "EXCEEDS_REMAINING", amount: calculated, remaining };
  return { valid: true, amount: calculated, remaining };
}
