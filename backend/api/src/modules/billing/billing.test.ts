import { describe, expect, it } from "vitest";
import { priceForInterval } from "./billing.service.js";
import { startSubscriptionSchema, checkoutSchema } from "./billing.schemas.js";

describe("P05 billing rules", () => {
  const plan = { monthlyPrice: "1999.00", quarterlyPrice: "5697.00", yearlyPrice: "21588.00" };
  it("selects interval-specific price", () => {
    expect(priceForInterval(plan, "MONTHLY")).toBe(1999);
    expect(priceForInterval(plan, "QUARTERLY")).toBe(5697);
    expect(priceForInterval(plan, "YEARLY")).toBe(21588);
  });
  it("rejects unavailable billing interval", () => {
    expect(() => priceForInterval({ ...plan, yearlyPrice: null }, "YEARLY")).toThrow();
  });
  it("validates plan selection", () => {
    expect(startSubscriptionSchema.safeParse({ planKey: "STARTER" }).success).toBe(true);
    expect(startSubscriptionSchema.safeParse({ planKey: "", interval: "WEEKLY" }).success).toBe(false);
  });
  it("requires secure checkout return URLs", () => {
    expect(checkoutSchema.safeParse({ invoiceId: "i1", returnUrl: "https://school.example/return" }).success).toBe(true);
    expect(checkoutSchema.safeParse({ invoiceId: "i1", returnUrl: "http://evil.example/return" }).success).toBe(false);
  });
});
