export type FeePaymentCalculation = { amountPaid: string; status: "PAID" | "PARTIALLY_PAID" };
function cents(value: number | string): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isSafeInteger(Math.round((parsed + Number.EPSILON) * 100))) return null;
  return Math.round((parsed + Number.EPSILON) * 100);
}
export function calculateFeePayment(total: number | string, paid: number | string, payment: number | string): FeePaymentCalculation | null {
  const totalCents = cents(total), paidCents = cents(paid), paymentCents = cents(payment);
  if (totalCents === null || paidCents === null || paymentCents === null || paymentCents <= 0 || paidCents > totalCents || paidCents + paymentCents > totalCents) return null;
  const next = paidCents + paymentCents;
  return { amountPaid: (next / 100).toFixed(2), status: next === totalCents ? "PAID" : "PARTIALLY_PAID" };
}
