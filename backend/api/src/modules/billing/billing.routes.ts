import { Router } from "express";
import { createHash, randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasOrganizationAdminAccess } from "../organizations/organization.authorization.js";
import { checkoutSchema, startSubscriptionSchema, webhookSchema } from "./billing.schemas.js";
import { priceForInterval } from "./billing.service.js";
import { classifyPaymentWebhookReplay } from "./payment-webhook-idempotency.js";
import { verifyPaymentWebhookSignature } from "./payment-webhook-signature.js";

export const billingRouter = Router();

function asyncRoute(fn: (req: any, res: any) => Promise<unknown>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);
}
function invoiceNo() { return `INV-${new Date().getUTCFullYear()}-${randomUUID().slice(0,8).toUpperCase()}`; }

billingRouter.get("/plans", asyncRoute(async (_req, res) => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true, isPublic: true },
    orderBy: { sortOrder: "asc" },
    select: {
      key: true, name: true, description: true, currency: true, monthlyPrice: true,
      quarterlyPrice: true, yearlyPrice: true, trialDays: true, entitlements: true, limits: true
    }
  });
  return res.json({ data: plans });
}));

billingRouter.post("/organizations/:organizationId/subscription", authenticate, asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const organizationId = req.params.organizationId;
  if (!(await hasOrganizationAdminAccess(userId, organizationId))) return res.status(403).json({ error: "Organization administrator access required" });
  const parsed = startSubscriptionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid subscription selection" });
  const plan = await prisma.subscriptionPlan.findFirst({ where: { key: parsed.data.planKey, isActive: true, isPublic: true } });
  if (!plan) return res.status(404).json({ error: "Subscription plan not found" });
  let price: number;
  try { price = priceForInterval(plan, parsed.data.interval); }
  catch { return res.status(400).json({ error: "Selected billing interval is unavailable" }); }

  const now = new Date();
  const trialEndsAt = plan.trialDays > 0 ? new Date(now.getTime() + plan.trialDays * 86400000) : null;
  const periodEnd = trialEndsAt ?? new Date(now.getTime() + (parsed.data.interval === "YEARLY" ? 365 : parsed.data.interval === "QUARTERLY" ? 90 : 30) * 86400000);
  const created = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT set_config('app.current_organization_id', ${organizationId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_school_id', '', true)`;
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_admin', 'false', true)`;
    const existing = await tx.organizationSubscription.findFirst({
      where: { organizationId, status: { in: ["PENDING_PAYMENT", "TRIALING", "ACTIVE", "PAST_DUE", "PAUSED"] } }
    });
    if (existing) return { conflict: true as const };
    const subscription = await tx.organizationSubscription.create({
      data: {
        organizationId, planId: plan.id, status: trialEndsAt ? "TRIALING" : "PENDING_PAYMENT",
        billingInterval: parsed.data.interval, currency: plan.currency, unitPrice: price,
        trialStartsAt: trialEndsAt ? now : null, trialEndsAt,
        currentPeriodStartsAt: now, currentPeriodEndsAt: periodEnd, createdBy: userId
      }
    });
    await tx.auditLog.create({
      data: { actorUserId: userId, organizationId, action: "billing.subscription.started",
        resourceType: "OrganizationSubscription", resourceId: subscription.id, outcome: "SUCCESS",
        metadata: { planKey: plan.key, interval: parsed.data.interval, trialDays: plan.trialDays } }
    });
    return { conflict: false as const, subscription };
  });
  if (created.conflict) return res.status(409).json({ error: "Organization already has a live subscription" });
  return res.status(201).json({ data: created.subscription });
}));

billingRouter.get("/organizations/:organizationId/subscription", authenticate, asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const organizationId = req.params.organizationId;
  const subscription = await withTenantContext(prisma, { organizationId, userId }, async tx => {
    const membership = await tx.organizationMembership.findFirst({ where: { organizationId, userId, status: "ACTIVE" } });
    if (!membership) return null;
    return tx.organizationSubscription.findFirst({
      where: { organizationId }, orderBy: { createdAt: "desc" }
    });
  });
  if (!subscription) return res.status(404).json({ error: "Subscription not found or organization membership required" });
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: subscription.planId },
    select: { key: true, name: true, entitlements: true, limits: true }
  });
  return res.json({ data: { ...subscription, plan } });
}));

billingRouter.get("/organizations/:organizationId/invoices", authenticate, asyncRoute(async (req, res) => {
  const organizationId = req.params.organizationId;
  const userId = req.auth!.userId;
  const invoices = await withTenantContext(prisma, { organizationId, userId }, async tx => {
    const member = await tx.organizationMembership.findFirst({ where: { organizationId, userId, status: "ACTIVE" } });
    if (!member) return null;
    return tx.billingInvoice.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 100 });
  });
  if (!invoices) return res.status(403).json({ error: "Organization membership required" });
  return res.json({ data: invoices });
}));

billingRouter.post("/organizations/:organizationId/checkout", authenticate, asyncRoute(async (req, res) => {
  const organizationId = req.params.organizationId;
  const userId = req.auth!.userId;
  if (!(await hasOrganizationAdminAccess(userId, organizationId))) return res.status(403).json({ error: "Organization administrator access required" });
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid checkout request" });
  const invoice = await withTenantContext(prisma, { organizationId, userId }, tx =>
    tx.billingInvoice.findFirst({ where: { id: parsed.data.invoiceId, organizationId, status: "OPEN" } })
  );
  if (!invoice) return res.status(404).json({ error: "Open invoice not found" });
  const idempotencyKey = req.get("idempotency-key") || randomUUID();
  const existing = await withTenantContext(prisma, { organizationId, userId }, tx =>
    tx.paymentAttempt.findUnique({ where: { organizationId_idempotencyKey: { organizationId, idempotencyKey } } })
  );
  if (existing) return res.json({ data: existing });
  // Gateway adapter is deliberately not configured in this phase. Create an auditable
  // pending attempt and return a clear configuration response instead of simulating payment.
  const attempt = await withTenantContext(prisma, { organizationId, userId }, tx =>
    tx.paymentAttempt.create({
      data: {
        organizationId, invoiceId: invoice.id, provider: "UNCONFIGURED",
        idempotencyKey, status: "CREATED", currency: invoice.currency, amount: invoice.amountDue
      }
    })
  );
  return res.status(202).json({ data: attempt, message: "Payment gateway is not configured. No payment was initiated." });
}));

billingRouter.post("/webhooks/:provider", asyncRoute(async (req, res) => {
  const providerInput = String(req.params.provider || "");
  if (!/^[a-z][a-z0-9_]{1,39}$/i.test(providerInput)) return res.status(400).json({ error: "Invalid payment provider identifier" });
  const provider = providerInput.toUpperCase();
  const secret = process.env[`PAYMENT_WEBHOOK_SECRET_${provider}`];
  const signature = req.get("x-payment-signature") || "";
  const rawBody = (req as typeof req & { rawBody?: Buffer }).rawBody;
  if (!secret || !rawBody) return res.status(503).json({ error: "Webhook provider is not configured" });
  if (rawBody.length > 64 * 1024) return res.status(413).json({ error: "Webhook payload exceeds the 64 KB limit" });
  if (!verifyPaymentWebhookSignature(rawBody, signature, secret)) return res.status(401).json({ error: "Invalid or expired webhook signature" });
  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid webhook event" });
  const payloadHash = createHash("sha256").update(rawBody).digest("hex");
  let existing = await prisma.paymentWebhookEvent.findUnique({
    where: { provider_providerEventId: { provider, providerEventId: parsed.data.id } }
  });
  let replay = classifyPaymentWebhookReplay(existing, payloadHash);
  if (replay === "PAYLOAD_CONFLICT") return res.status(409).json({ error: "Provider event ID was already used with a different payload" });
  if (replay === "DUPLICATE") return res.status(200).json({ received: true, duplicate: true });
  if (replay === "NEW") {
    try {
      existing = await prisma.paymentWebhookEvent.create({
        data: { provider, providerEventId: parsed.data.id, eventType: parsed.data.type, payloadHash }
      });
    } catch (error) {
      const raced = await prisma.paymentWebhookEvent.findUnique({
        where: { provider_providerEventId: { provider, providerEventId: parsed.data.id } }
      });
      if (!raced) throw error;
      replay = classifyPaymentWebhookReplay(raced, payloadHash);
      if (replay === "PAYLOAD_CONFLICT") return res.status(409).json({ error: "Provider event ID was already used with a different payload" });
      if (replay === "DUPLICATE") return res.status(200).json({ received: true, duplicate: true });
    }
  }
  // Provider-specific reconciliation is intentionally not guessed. A configured
  // gateway adapter must map verified provider events to payment attempts/invoices.
  await prisma.paymentWebhookEvent.update({
    where: { provider_providerEventId: { provider, providerEventId: parsed.data.id } },
    data: { processingError: "Verified event stored; provider reconciliation adapter not configured" }
  });
  return res.status(202).json({ received: true, reconciled: false });
}));

billingRouter.get("/organizations/:organizationId/entitlements/:featureKey", authenticate, asyncRoute(async (req, res) => {
  const organizationId = req.params.organizationId;
  const userId = req.auth!.userId;
  const entitlement = await withTenantContext(prisma, { organizationId, userId }, async tx => {
    const membership = await tx.organizationMembership.findFirst({ where: { organizationId, userId, status: "ACTIVE" } });
    if (!membership) return null;
    const override = await tx.organizationEntitlementOverride.findFirst({
      where: { organizationId, featureKey: req.params.featureKey, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }
    });
    if (override) return { enabled: override.enabled, limit: override.limitValue, source: "override" };
    const subscription = await tx.organizationSubscription.findFirst({
      where: { organizationId, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] }, currentPeriodEndsAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    });
    if (!subscription) return { enabled: false, limit: null, source: "no_subscription" };
    const plan = await tx.subscriptionPlan.findUnique({ where: { id: subscription.planId } });
    if (!plan || !plan.isActive) return { enabled: false, limit: null, source: "plan_unavailable" };
    const entitlements = plan.entitlements as Record<string, unknown>;
    const limits = plan.limits as Record<string, unknown>;
    return { enabled: entitlements[req.params.featureKey] === true, limit: limits[req.params.featureKey] ?? null, source: "plan" };
  });
  if (!entitlement) return res.status(403).json({ error: "Organization membership required" });
  return res.json({ data: entitlement });
}));
