import { prisma } from "../../lib/prisma.js";
import { withTenantContext } from "../auth/tenant-context.js";

export type Interval = "MONTHLY" | "QUARTERLY" | "YEARLY";

export function priceForInterval(plan: { monthlyPrice: unknown; quarterlyPrice: unknown; yearlyPrice: unknown }, interval: Interval): number {
  const raw = interval === "YEARLY" ? plan.yearlyPrice : interval === "QUARTERLY" ? plan.quarterlyPrice : plan.monthlyPrice;
  if (raw === null || raw === undefined) throw new Error("Selected billing interval is not available");
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid plan price");
  return amount;
}

export async function resolveEntitlement(organizationId: string, featureKey: string) {
  const [subscription, override] = await Promise.all([
    withTenantContext(prisma, { organizationId }, tx => tx.organizationSubscription.findFirst({
      where: { organizationId, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] }, currentPeriodEndsAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    })),
    withTenantContext(prisma, { organizationId }, tx => tx.organizationEntitlementOverride.findFirst({
      where: { organizationId, featureKey, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }
    }))
  ]);
  if (override) return { enabled: override.enabled, limit: override.limitValue, source: "override" as const };
  if (!subscription) return { enabled: false, limit: null, source: "no_subscription" as const };
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: subscription.planId } });
  if (!plan || !plan.isActive) return { enabled: false, limit: null, source: "plan_unavailable" as const };
  const entitlements = plan.entitlements as Record<string, unknown>;
  const limits = plan.limits as Record<string, unknown>;
  return {
    enabled: entitlements[featureKey] === true,
    limit: limits[featureKey] ?? null,
    source: "plan" as const
  };
}
