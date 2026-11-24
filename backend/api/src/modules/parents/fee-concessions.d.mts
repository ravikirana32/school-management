export type FeeConcessionType = "FIXED" | "PERCENTAGE";
export type FeeConcessionCalculation =
  | { valid: true; amount: number; remaining: number }
  | { valid: false; reason: string; amount: number; remaining: number };
export function calculateFeeConcession(input: {
  grossAmount: number;
  type: FeeConcessionType;
  value: number;
  approvedExisting?: number;
}): FeeConcessionCalculation;
