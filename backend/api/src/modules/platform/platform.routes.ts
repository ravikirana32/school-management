import { withPlatformContext } from "../auth/tenant-context.js";
import { Router } from "express";
import { resolveTxt } from "node:dns/promises";
import { domainToASCII } from "node:url";
import { isIP } from "node:net";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { encryptPlatformSecret } from "./platform-secrets.js";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { requirePlatformAdmin } from "./platform.middleware.js";
import { isMfaEnabled } from "../auth/mfa-policy.js";
import {
  createOrganizationSchema, updateTenantStatusSchema, createSchoolSchema, supportGrantSchema
} from "./platform.schemas.js";

export const platformRouter = Router();
platformRouter.use(authenticate, requirePlatformAdmin);

function asyncRoute(fn: (req: any, res: any) => Promise<unknown>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);
}

platformRouter.get("/dashboard", asyncRoute(async (_req, res) => {
  const [organizations, schools, users, suspendedOrganizations] = await Promise.all([
    prisma.organization.count(),
    withPlatformContext(prisma, tx => tx.school.count()),
    prisma.user.count(),
    prisma.tenantLifecycleEvent.count({ where: { toStatus: "SUSPENDED" } })
  ]);
  return res.json({ data: { organizations, schools, users, suspendedOrganizations } });
}));

platformRouter.get("/organizations", asyncRoute(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const where = search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {};
  const [items, total] = await Promise.all([
    prisma.organization.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, country: true, timezone: true, isActive: true, createdAt: true }
    }),
    prisma.organization.count({ where })
  ]);
  return res.json({ data: items, pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) } });
}));

platformRouter.post("/organizations", asyncRoute(async (req, res) => {
  const parsed = createOrganizationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid organization details" });
  const organization = await prisma.organization.create({ data: parsed.data });
  await prisma.auditLog.create({
    data: {
      actorUserId: req.auth!.userId, organizationId: organization.id,
      action: "platform.organization.created", resourceType: "Organization",
      resourceId: organization.id, outcome: "SUCCESS"
    }
  });
  return res.status(201).json({ data: organization });
}));

platformRouter.get("/organizations/:organizationId", asyncRoute(async (req, res) => {
  const organization = await prisma.organization.findUnique({
    where: { id: req.params.organizationId }
  });
  if (!organization) return res.status(404).json({ error: "Organization not found" });
  const schoolCount = await withPlatformContext(prisma, tx => tx.school.count({ where: { organizationId: organization.id } }));
  return res.json({ data: { ...organization, schoolCount } });
}));

platformRouter.patch("/organizations/:organizationId/status", asyncRoute(async (req, res) => {
  const parsed = updateTenantStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid status transition request" });
  const organizationId = req.params.organizationId;
  const result = await prisma.$transaction(async tx => {
    const current = await tx.organization.findUnique({ where: { id: organizationId } });
    if (!current) return null;
    const isActive = parsed.data.status === "ACTIVE";
    const updated = await tx.organization.update({ where: { id: organizationId }, data: { isActive, lifecycleStatus: parsed.data.status } });
    await tx.tenantLifecycleEvent.create({
      data: {
        organizationId, fromStatus: current.isActive ? "ACTIVE" : "SUSPENDED",
        toStatus: parsed.data.status, reason: parsed.data.reason, performedBy: req.auth!.userId
      }
    });
    await tx.auditLog.create({
      data: {
        actorUserId: req.auth!.userId, organizationId, action: "platform.organization.status_changed",
        resourceType: "Organization", resourceId: organizationId, outcome: "SUCCESS",
        metadata: { fromActive: current.isActive, toStatus: parsed.data.status, reason: parsed.data.reason }
      }
    });
    return updated;
  });
  if (!result) return res.status(404).json({ error: "Organization not found" });
  return res.json({ data: result });
}));

platformRouter.post("/organizations/:organizationId/schools", asyncRoute(async (req, res) => {
  const parsed = createSchoolSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid school details" });
  const organization = await prisma.organization.findUnique({ where: { id: req.params.organizationId } });
  if (!organization) return res.status(404).json({ error: "Organization not found" });
  const school = await withPlatformContext(prisma, tx => tx.school.create({
    data: { ...parsed.data, organizationId: organization.id, lifecycleStatus: "ACTIVE", isActive: true }
  }));
  await prisma.auditLog.create({
    data: {
      actorUserId: req.auth!.userId, organizationId: organization.id, schoolId: school.id,
      action: "platform.school.created", resourceType: "School", resourceId: school.id, outcome: "SUCCESS"
    }
  });
  return res.status(201).json({ data: school });
}));

platformRouter.get("/support-access-grants", asyncRoute(async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const where = status && ["PENDING_APPROVAL","ACTIVE","REJECTED","REVOKED"].includes(status) ? { status: status as any } : {};
  const grants = await prisma.supportAccessGrant.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  return res.json({ data: grants });
}));

platformRouter.post("/support-access-grants", asyncRoute(async (req, res) => {
  const parsed = supportGrantSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid support access request" });
  if (parsed.data.startsAt < new Date(Date.now() + 60_000) || parsed.data.expiresAt.getTime() - parsed.data.startsAt.getTime() > 4 * 60 * 60 * 1000) {
    return res.status(400).json({ error: "Support requests must start at least one minute in the future and last no longer than four hours" });
  }
  if (parsed.data.grantedTo === req.auth!.userId) {
    return res.status(400).json({ error: "Support access cannot be requested for yourself" });
  }
  const [organization, target] = await Promise.all([
    prisma.organization.findUnique({ where: { id: parsed.data.organizationId }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: parsed.data.grantedTo }, select: { id: true, isActive: true, isPlatformAdmin: true } })
  ]);
  if (!organization || !target?.isActive || !target.isPlatformAdmin) return res.status(404).json({ error: "Organization or eligible support operator not found" });
  const grant = await prisma.supportAccessGrant.create({
    data: {
      ...parsed.data, requestedBy: req.auth!.userId, approvedBy: null,
      status: "PENDING_APPROVAL", approvedAt: null
    }
  });
  await prisma.auditLog.create({
    data: {
      actorUserId: req.auth!.userId, organizationId: organization.id,
      action: "platform.support_access.requested", resourceType: "SupportAccessGrant",
      resourceId: grant.id, outcome: "SUCCESS",
      metadata: { grantedTo: grant.grantedTo, expiresAt: grant.expiresAt, ticketReference: grant.ticketReference }
    }
  });
  return res.status(201).json({ data: grant, message: "Pending independent approval and fresh MFA verification." });
}));

platformRouter.post("/support-access-grants/:grantId/approve", asyncRoute(async (req, res) => {
  const grant = await prisma.supportAccessGrant.findUnique({ where: { id: req.params.grantId } });
  if (!grant) return res.status(404).json({ error: "Support access request not found" });
  if (grant.requestedBy === req.auth!.userId) return res.status(403).json({ error: "A different platform administrator must approve this request" });
  if (isMfaEnabled() && (!req.auth!.mfaVerifiedAt || req.auth!.mfaVerifiedAt.getTime() < Date.now() - 5 * 60 * 1000)) {
    return res.status(403).json({ error: "Fresh MFA verification (within five minutes) is required. This deployment does not yet expose an MFA challenge-completion flow." });
  }
  const now = new Date();
  const result = await prisma.$transaction(async tx => {
    const updated = await tx.supportAccessGrant.updateMany({
      where: { id: grant.id, status: "PENDING_APPROVAL", requestedBy: { not: req.auth!.userId }, startsAt: { gt: now }, expiresAt: { gt: now } },
      data: { status: "ACTIVE", approvedBy: req.auth!.userId, approvedAt: now }
    });
    if (updated.count !== 1) return null;
    return tx.supportAccessGrant.findUnique({ where: { id: grant.id } });
  });
  if (!result) return res.status(409).json({ error: "Request is no longer pending or its time window has elapsed" });
  await prisma.auditLog.create({
    data: { actorUserId: req.auth!.userId, organizationId: grant.organizationId, action: "platform.support_access.approved", resourceType: "SupportAccessGrant", resourceId: grant.id, outcome: "SUCCESS" }
  });
  return res.json({ data: result });
}));

platformRouter.post("/support-access-grants/:grantId/reject", asyncRoute(async (req, res) => {
  const body = z.object({ reason: z.string().trim().min(10).max(500) }).strict().safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "A rejection reason is required" });
  const grant = await prisma.supportAccessGrant.findUnique({ where: { id: req.params.grantId } });
  if (!grant) return res.status(404).json({ error: "Support access request not found" });
  if (grant.requestedBy === req.auth!.userId) return res.status(403).json({ error: "The requester cannot reject their own request" });
  const result = await prisma.supportAccessGrant.updateMany({
    where: { id: grant.id, status: "PENDING_APPROVAL" },
    data: { status: "REJECTED", approvedBy: req.auth!.userId, rejectionReason: body.data.reason }
  });
  if (!result.count) return res.status(409).json({ error: "Request is no longer pending" });
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, organizationId: grant.organizationId, action: "platform.support_access.rejected", resourceType: "SupportAccessGrant", resourceId: grant.id, outcome: "SUCCESS", metadata: { reason: body.data.reason } } });
  return res.json({ data: { id: grant.id, status: "REJECTED" } });
}));

platformRouter.post("/support-access-grants/:grantId/revoke", asyncRoute(async (req, res) => {
  const body = z.object({ reason: z.string().trim().min(10).max(500) }).strict().safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "A revocation reason is required" });
  const grant = await prisma.supportAccessGrant.findUnique({ where: { id: req.params.grantId } });
  if (!grant) return res.status(404).json({ error: "Support access grant not found" });
  const result = await prisma.supportAccessGrant.updateMany({
    where: { id: grant.id, status: "ACTIVE", revokedAt: null },
    data: { status: "REVOKED", revokedAt: new Date(), revokeReason: body.data.reason }
  });
  if (!result.count) return res.status(409).json({ error: "Only active grants can be revoked" });
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, organizationId: grant.organizationId, action: "platform.support_access.revoked", resourceType: "SupportAccessGrant", resourceId: grant.id, outcome: "SUCCESS", metadata: { reason: body.data.reason } } });
  return res.json({ data: { id: grant.id, status: "REVOKED" } });
}));

function normalizeHostname(input: unknown) {
  if (typeof input !== "string") return null;
  const raw = input.trim().toLowerCase().replace(/\.$/, "");
  const ascii = domainToASCII(raw);
  if (!ascii || ascii.length > 253 || ascii.includes("://") || isIP(ascii)) return null;
  const labels = ascii.split(".");
  if (labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return null;
  if (["localhost", "example.com", "example.org", "invalid"].includes(ascii)) return null;
  return ascii;
}

platformRouter.get("/organizations/:organizationId/domains", asyncRoute(async (req, res) => {
  const domains = await withPlatformContext(prisma, tx => tx.tenantCustomDomain.findMany({
    where: { organizationId: req.params.organizationId }, orderBy: { createdAt: "desc" }
  }));
  return res.json({ data: domains.map(({ challengeHash, ...domain }) => domain) });
}));

platformRouter.post("/organizations/:organizationId/domains", asyncRoute(async (req, res) => {
  const hostname = normalizeHostname(req.body?.hostname);
  if (!hostname) return res.status(400).json({ error: "Enter a valid fully-qualified custom domain" });
  const organization = await prisma.organization.findUnique({ where: { id: req.params.organizationId }, select: { id: true } });
  if (!organization) return res.status(404).json({ error: "Organization not found" });
  const challenge = randomBytes(32).toString("hex");
  try {
    const domain = await withPlatformContext(prisma, tx => tx.tenantCustomDomain.create({
      data: { organizationId: organization.id, hostname, challengeHash: createHash("sha256").update(challenge).digest("hex"), challengeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), createdBy: req.auth!.userId }
    }));
    await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, organizationId: organization.id, action: "platform.domain.created", resourceType: "TenantCustomDomain", resourceId: domain.id, outcome: "SUCCESS", metadata: { hostname } } });
    const { challengeHash, ...safe } = domain;
    return res.status(201).json({ data: safe, dnsChallenge: { type: "TXT", name: `_school-saas-verification.${hostname}`, value: `school-saas-verification=${challenge}` } });
  } catch (error: any) {
    if (error?.code === "P2002") return res.status(409).json({ error: "This hostname is already registered" });
    throw error;
  }
}));

platformRouter.post("/domains/:domainId/challenge", asyncRoute(async (req, res) => {
  const domain = await withPlatformContext(prisma, tx => tx.tenantCustomDomain.findUnique({ where: { id: req.params.domainId } }));
  if (!domain) return res.status(404).json({ error: "Domain not found" });
  if (!["PENDING_VERIFICATION", "VERIFIED"].includes(domain.status)) return res.status(409).json({ error: "A challenge can only be renewed for a pending or verified domain" });
  const challenge = randomBytes(32).toString("hex");
  const updated = await withPlatformContext(prisma, tx => tx.tenantCustomDomain.update({
    where: { id: domain.id },
    data: { challengeHash: createHash("sha256").update(challenge).digest("hex"), challengeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), status: "PENDING_VERIFICATION", verifiedAt: null }
  }));
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, organizationId: domain.organizationId, action: "platform.domain.challenge_rotated", resourceType: "TenantCustomDomain", resourceId: domain.id, outcome: "SUCCESS" } });
  return res.json({ data: { id: updated.id, hostname: updated.hostname, status: updated.status }, dnsChallenge: { type: "TXT", name: `_school-saas-verification.${updated.hostname}`, value: `school-saas-verification=${challenge}` } });
}));

platformRouter.post("/domains/:domainId/verify", asyncRoute(async (req, res) => {
  const domain = await withPlatformContext(prisma, tx => tx.tenantCustomDomain.findUnique({ where: { id: req.params.domainId } }));
  if (!domain) return res.status(404).json({ error: "Domain not found" });
  if (domain.status === "ACTIVE") return res.json({ data: { id: domain.id, status: domain.status } });
  if (domain.status !== "PENDING_VERIFICATION" && domain.status !== "VERIFIED") return res.status(409).json({ error: "Disabled domains must be re-registered before verification" });
  if (domain.status === "VERIFIED") return res.json({ data: { id: domain.id, hostname: domain.hostname, status: domain.status, verifiedAt: domain.verifiedAt } });
  if (domain.challengeExpiresAt <= new Date()) return res.status(410).json({ error: "DNS challenge expired. Generate a fresh challenge and publish it." });
  const recordName = `_school-saas-verification.${domain.hostname}`;
  let records: string[][] = [];
  try { records = await resolveTxt(recordName); } catch { return res.status(409).json({ error: "DNS TXT challenge was not found. Publish the challenge and retry." }); }
  const valid = records.map(chunks => chunks.join("")).some(value => value.startsWith("school-saas-verification=") &&
    createHash("sha256").update(value.slice("school-saas-verification=".length)).digest("hex") === domain.challengeHash);
  if (!valid) return res.status(409).json({ error: "DNS TXT challenge does not match this domain registration" });
  const updated = await withPlatformContext(prisma, tx => tx.tenantCustomDomain.update({
    where: { id: domain.id }, data: { status: "VERIFIED", verifiedAt: new Date() }
  }));
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, organizationId: domain.organizationId, action: "platform.domain.verified", resourceType: "TenantCustomDomain", resourceId: domain.id, outcome: "SUCCESS" } });
  return res.json({ data: { id: updated.id, hostname: updated.hostname, status: updated.status, verifiedAt: updated.verifiedAt } });
}));

platformRouter.post("/domains/:domainId/activate", asyncRoute(async (req, res) => {
  const updated = await withPlatformContext(prisma, async tx => {
    const domain = await tx.tenantCustomDomain.findUnique({ where: { id: req.params.domainId } });
    if (!domain || !["VERIFIED", "DISABLED"].includes(domain.status) || !domain.verifiedAt) return null;
    const organization = await tx.organization.findFirst({ where: { id: domain.organizationId, isActive: true }, select: { id: true } });
    if (!organization) return null;
    return tx.tenantCustomDomain.update({ where: { id: domain.id }, data: { status: "ACTIVE", activatedAt: new Date(), disabledAt: null } });
  });
  if (!updated) return res.status(409).json({ error: "Only DNS-verified domains can be activated" });
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, organizationId: updated.organizationId, action: "platform.domain.activated", resourceType: "TenantCustomDomain", resourceId: updated.id, outcome: "SUCCESS" } });
  return res.json({ data: { id: updated.id, hostname: updated.hostname, status: updated.status } });
}));

platformRouter.post("/domains/:domainId/disable", asyncRoute(async (req, res) => {
  const updated = await withPlatformContext(prisma, async tx => {
    const domain = await tx.tenantCustomDomain.findUnique({ where: { id: req.params.domainId } });
    if (!domain) return null;
    return tx.tenantCustomDomain.update({ where: { id: domain.id }, data: { status: "DISABLED", disabledAt: new Date() } });
  });
  if (!updated) return res.status(404).json({ error: "Domain not found" });
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, organizationId: updated.organizationId, action: "platform.domain.disabled", resourceType: "TenantCustomDomain", resourceId: updated.id, outcome: "SUCCESS" } });
  return res.json({ data: { id: updated.id, hostname: updated.hostname, status: updated.status } });
}));

const brandingSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  logoUrl: z.string().url().refine(v => v.startsWith("https://"), "Logo URL must use HTTPS").optional().nullable(),
  faviconUrl: z.string().url().refine(v => v.startsWith("https://"), "Favicon URL must use HTTPS").optional().nullable(),
  supportEmail: z.string().email().max(254).optional().nullable(),
  supportUrl: z.string().url().refine(v => v.startsWith("https://"), "Support URL must use HTTPS").optional().nullable(),
  loginMessage: z.string().trim().max(300).optional().nullable()
}).strict();

platformRouter.get("/organizations/:organizationId/branding", asyncRoute(async (req, res) => {
  const branding = await withPlatformContext(prisma, tx => tx.tenantBranding.findUnique({ where: { organizationId: req.params.organizationId } }));
  return res.json({ data: branding });
}));

platformRouter.put("/organizations/:organizationId/branding", asyncRoute(async (req, res) => {
  const parsed = brandingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid tenant branding", details: parsed.error.flatten() });
  const organization = await prisma.organization.findUnique({ where: { id: req.params.organizationId }, select: { id: true } });
  if (!organization) return res.status(404).json({ error: "Organization not found" });
  const branding = await withPlatformContext(prisma, tx => tx.tenantBranding.upsert({
    where: { organizationId: organization.id },
    create: { ...parsed.data, organizationId: organization.id, updatedBy: req.auth!.userId },
    update: { ...parsed.data, updatedBy: req.auth!.userId }
  }));
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, organizationId: organization.id, action: "platform.tenant_branding.updated", resourceType: "TenantBranding", resourceId: branding.id, outcome: "SUCCESS" } });
  return res.json({ data: branding });
}));

platformRouter.get("/secrets", asyncRoute(async (_req, res) => {
  const secrets = await withPlatformContext(prisma, tx => tx.platformSecret.findMany({ orderBy: { key: "asc" }, select: { id: true, key: true, keyVersion: true, rotatedAt: true, updatedAt: true, updatedBy: true } }));
  return res.json({ data: secrets });
}));

platformRouter.put("/secrets/:key", asyncRoute(async (req, res) => {
  const key = String(req.params.key);
  const parsed = z.object({ value: z.string().min(1).max(10000) }).strict().safeParse(req.body);
  if (!/^[A-Z][A-Z0-9_]{2,99}$/.test(key) || !parsed.success) return res.status(400).json({ error: "Invalid secret key or value" });
  const encrypted = encryptPlatformSecret(parsed.data.value);
  const secret = await withPlatformContext(prisma, tx => tx.platformSecret.upsert({
    where: { key },
    create: { key, ...encrypted, createdBy: req.auth!.userId, updatedBy: req.auth!.userId },
    update: { ...encrypted, updatedBy: req.auth!.userId, rotatedAt: new Date() }
  }));
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.secret.rotated", resourceType: "PlatformSecret", resourceId: secret.id, outcome: "SUCCESS", metadata: { key } } });
  return res.status(201).json({ data: { id: secret.id, key: secret.key, keyVersion: secret.keyVersion, rotatedAt: secret.rotatedAt } });
}));

platformRouter.delete("/secrets/:key", asyncRoute(async (req, res) => {
  const secret = await withPlatformContext(prisma, tx => tx.platformSecret.findUnique({ where: { key: req.params.key }, select: { id: true, key: true } }));
  if (!secret) return res.status(404).json({ error: "Secret not found" });
  await withPlatformContext(prisma, tx => tx.platformSecret.delete({ where: { key: secret.key } }));
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.secret.deleted", resourceType: "PlatformSecret", resourceId: secret.id, outcome: "SUCCESS", metadata: { key: secret.key } } });
  return res.status(204).send();
}));

platformRouter.get("/settings", asyncRoute(async (_req, res) => {
  const settings = await prisma.platformControlSetting.findMany({
    where: { isSecret: false }, orderBy: { key: "asc" },
    select: { key: true, value: true, valueType: true, description: true, updatedAt: true }
  });
  return res.json({ data: settings });
}));

platformRouter.put("/settings/:key", asyncRoute(async (req, res) => {
  const key = String(req.params.key);
  if (!/^[a-z][a-z0-9_.-]{2,100}$/.test(key)) return res.status(400).json({ error: "Invalid setting key" });
  if (!Object.prototype.hasOwnProperty.call(req.body ?? {}, "value")) return res.status(400).json({ error: "Setting value is required" });
  const setting = await prisma.platformControlSetting.upsert({
    where: { key },
    create: { key, value: req.body.value, valueType: "JSON", description: typeof req.body.description === "string" ? req.body.description.slice(0, 500) : null, updatedBy: req.auth!.userId },
    update: { value: req.body.value, description: typeof req.body.description === "string" ? req.body.description.slice(0, 500) : undefined, updatedBy: req.auth!.userId }
  });
  await prisma.auditLog.create({
    data: {
      actorUserId: req.auth!.userId, action: "platform.setting.updated",
      resourceType: "PlatformSetting", resourceId: setting.id, outcome: "SUCCESS",
      metadata: { key }
    }
  });
  return res.json({ data: { key: setting.key, updatedAt: setting.updatedAt } });
}));


// P448: persisted severity routing policy. Only active platform administrators may be recipients.
const DEFAULT_OPERATIONS_ALERT_POLICY = { enabled: true, severities: { INFO: { recipientUserIds: [], reminderMinutes: 60, escalationMinutes: 240 }, WARNING: { recipientUserIds: [], reminderMinutes: 30, escalationMinutes: 120 }, ERROR: { recipientUserIds: [], reminderMinutes: 15, escalationMinutes: 60 }, CRITICAL: { recipientUserIds: [], reminderMinutes: 5, escalationMinutes: 15 } } };
platformRouter.get("/operations-alert-policy", asyncRoute(async (_req, res) => {
  const setting = await prisma.platformControlSetting.findUnique({ where: { key: "operations_alert_policy" }, select: { value: true, updatedAt: true, updatedBy: true } });
  return res.json({ data: setting ? { policy: setting.value, updatedAt: setting.updatedAt, updatedBy: setting.updatedBy } : { policy: DEFAULT_OPERATIONS_ALERT_POLICY, updatedAt: null, updatedBy: null } });
}));
platformRouter.put("/operations-alert-policy", asyncRoute(async (req, res) => {
  const policy = req.body?.policy;
  if (!policy || typeof policy !== "object" || Array.isArray(policy) || typeof policy.enabled !== "boolean" || !policy.severities || typeof policy.severities !== "object") return res.status(400).json({ error: "policy must include enabled and severities" });
  const severityNames = ["INFO", "WARNING", "ERROR", "CRITICAL"];
  const recipients = new Set<string>();
  for (const severity of severityNames) {
    const rule = policy.severities[severity];
    if (!rule || !Array.isArray(rule.recipientUserIds) || rule.recipientUserIds.length > 100 || !Number.isInteger(rule.reminderMinutes) || rule.reminderMinutes < 1 || rule.reminderMinutes > 1440 || !Number.isInteger(rule.escalationMinutes) || rule.escalationMinutes < 1 || rule.escalationMinutes > 10080) return res.status(400).json({ error: `Invalid ${severity} routing rule` });
    for (const id of rule.recipientUserIds) { if (typeof id !== "string" || !id.trim() || id.length > 200) return res.status(400).json({ error: `Invalid recipient in ${severity}` }); recipients.add(id.trim()); }
  }
  const validUsers = recipients.size ? await prisma.user.findMany({ where: { id: { in: [...recipients] }, isPlatformAdmin: true, isActive: true }, select: { id: true } }) : [];
  if (validUsers.length !== recipients.size) return res.status(400).json({ error: "Recipients must be active platform administrators" });
  const normalized = { enabled: policy.enabled, severities: Object.fromEntries(severityNames.map(severity => { const rule = policy.severities[severity]; return [severity, { recipientUserIds: [...new Set(rule.recipientUserIds.map((id:string)=>id.trim()))], reminderMinutes: rule.reminderMinutes, escalationMinutes: rule.escalationMinutes }]; })) };
  const saved = await prisma.platformControlSetting.upsert({ where: { key: "operations_alert_policy" }, create: { key: "operations_alert_policy", value: normalized, valueType: "JSON", description: "P448 severity-specific alert routing and SLA policy", updatedBy: req.auth!.userId }, update: { value: normalized, updatedBy: req.auth!.userId, description: "P448 severity-specific alert routing and SLA policy" } });
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.operations_alert_policy.updated", resourceType: "PlatformSetting", resourceId: saved.id, outcome: "SUCCESS", metadata: { enabled: normalized.enabled, recipientCount: recipients.size } } });
  return res.json({ data: { policy: normalized, updatedAt: saved.updatedAt } });
}));

// P451: recipient channel preferences and adapter readiness. Only WEBHOOK delivery is executable in this phase.
const DEFAULT_OPERATIONS_ALERT_CHANNELS = { defaultChannels: ["WEBHOOK"], userPreferences: [] as Array<{ userId: string; channels: string[] }> };
platformRouter.get("/operations-alert-channel-preferences", asyncRoute(async (_req, res) => {
  const setting = await prisma.platformControlSetting.findUnique({ where: { key: "operations_alert_channel_preferences" }, select: { value: true, updatedAt: true, updatedBy: true } });
  return res.json({ data: setting ? { preferences: setting.value, updatedAt: setting.updatedAt, updatedBy: setting.updatedBy } : { preferences: DEFAULT_OPERATIONS_ALERT_CHANNELS, updatedAt: null, updatedBy: null } });
}));
platformRouter.put("/operations-alert-channel-preferences", asyncRoute(async (req, res) => {
  const preferences = req.body?.preferences;
  const allowed = ["IN_APP", "EMAIL", "WEBHOOK"];
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences) || !Array.isArray(preferences.defaultChannels) || !Array.isArray(preferences.userPreferences) || preferences.userPreferences.length > 500) return res.status(400).json({ error: "preferences must include defaultChannels and userPreferences arrays" });
  const normalizeChannels = (channels: unknown) => Array.isArray(channels) && channels.length <= 3 && channels.every((c: unknown) => typeof c === "string" && allowed.includes(c)) ? [...new Set(channels as string[])] : null;
  const defaultChannels = normalizeChannels(preferences.defaultChannels);
  if (!defaultChannels || !defaultChannels.includes("WEBHOOK")) return res.status(400).json({ error: "Default channels must include WEBHOOK until other adapters are active" });
  const seen = new Set<string>();
  const userPreferences: Array<{ userId: string; channels: string[] }> = [];
  for (const item of preferences.userPreferences) {
    if (!item || typeof item.userId !== "string" || !item.userId.trim() || item.userId.length > 200 || seen.has(item.userId.trim())) return res.status(400).json({ error: "Invalid or duplicate recipient preference" });
    const channels = normalizeChannels(item.channels);
    if (!channels || (channels.length > 0 && !channels.includes("WEBHOOK"))) return res.status(400).json({ error: "Recipient channels must include WEBHOOK or be empty to opt out; IN_APP/EMAIL adapters are not active" });
    seen.add(item.userId.trim()); userPreferences.push({ userId: item.userId.trim(), channels });
  }
  const validUsers = userPreferences.length ? await prisma.user.findMany({ where: { id: { in: userPreferences.map(p => p.userId) }, isPlatformAdmin: true, isActive: true }, select: { id: true } }) : [];
  if (validUsers.length !== userPreferences.length) return res.status(400).json({ error: "Preferences must target active platform administrators" });
  const normalized = { defaultChannels, userPreferences };
  const saved = await prisma.platformControlSetting.upsert({ where: { key: "operations_alert_channel_preferences" }, create: { key: "operations_alert_channel_preferences", value: normalized, valueType: "JSON", description: "P451 platform operations alert channel preferences", updatedBy: req.auth!.userId }, update: { value: normalized, updatedBy: req.auth!.userId, description: "P451 platform operations alert channel preferences" } });
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.operations_alert_channel_preferences.updated", resourceType: "PlatformSetting", resourceId: saved.id, outcome: "SUCCESS", metadata: { recipientCount: userPreferences.length, defaultChannels } } });
  return res.json({ data: { preferences: normalized, updatedAt: saved.updatedAt } });
}));

// P164: platform-wide operations alerts. This router is protected by the
// platform-admin + fresh-MFA middleware above; tenant APIs never expose NULL-tenant alerts.
platformRouter.get("/operations-alerts", asyncRoute(async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "ALL";
  const allowed = ["PENDING", "RETRY", "SENDING", "DELIVERED", "ALL"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid alert status" });
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const result = await withPlatformContext(prisma, async tx => {
    const rows = await tx.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT "id","eventType","severity","status","attempts","nextAttemptAt","lastErrorCode","deliveredAt","createdAt","updatedAt","acknowledgedAt","acknowledgedByUserId","acknowledgementNote","assignedToUserId","resolvedAt","resolvedByUserId","resolutionNote","organizationId","schoolId","escalatedAt","escalationLevel","payload","slaDueAt","followUpReminderAt","slaReminderSentAt","slaEscalationSentAt",(CASE WHEN "resolvedAt" IS NULL AND "slaDueAt" IS NOT NULL AND "slaDueAt" < NOW() THEN TRUE ELSE FALSE END) AS "slaOverdue" FROM "OperationsAlertOutbox" WHERE ($1='ALL' OR "status"=$1) ORDER BY "createdAt" DESC LIMIT $2`, status, limit);
    const counts = await tx.$queryRawUnsafe<Array<{status:string;count:number;unacknowledged:number}>>(
      `SELECT "status",COUNT(*)::int AS count,COUNT(*) FILTER (WHERE "acknowledgedAt" IS NULL)::int AS unacknowledged FROM "OperationsAlertOutbox" GROUP BY "status" ORDER BY "status"`);
    return { rows, counts };
  });
  return res.json({ data: result });
}));

platformRouter.post("/operations-alerts/:alertId/acknowledge", asyncRoute(async (req, res) => {
  const note = typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 500) : null;
  const changed = await withPlatformContext(prisma, async tx => {
    const count = await tx.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "acknowledgedAt"=NOW(),"acknowledgedByUserId"=$2,"acknowledgementNote"=$3,"updatedAt"=NOW() WHERE "id"=$1 AND "acknowledgedAt" IS NULL AND "resolvedAt" IS NULL`, req.params.alertId, req.auth!.userId, note || null);
    if (count) {
      await tx.$executeRawUnsafe(`INSERT INTO "OperationsAlertLifecycleHistory" ("id","alertId","action","actorUserId","comment","newValue") VALUES ($1,$2,'ACKNOWLEDGE',$3,$4,$5::jsonb)`, `oalh_${randomBytes(12).toString("hex")}`, req.params.alertId, req.auth!.userId, note, JSON.stringify({ acknowledgedAt: new Date().toISOString() }));
      await tx.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.operations_alert.acknowledged", resourceType: "OperationsAlertOutbox", resourceId: req.params.alertId, outcome: "SUCCESS", metadata: { hasNote: Boolean(note) } } });
    }
    return count;
  });
  if (!changed) return res.status(404).json({ error: "Alert not found, already acknowledged, or resolved" });
  return res.json({ data: { acknowledged: true } });
}));


platformRouter.post("/operations-alerts/:alertId/assign", asyncRoute(async (req, res) => {
  const userId = typeof req.body?.userId === "string" ? req.body.userId.trim().slice(0, 200) : "";
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const eligible = await prisma.user.findFirst({ where: { id: userId, isPlatformAdmin: true, isActive: true }, select: { id: true } });
  if (!eligible) return res.status(400).json({ error: "Assignment target must be an active platform administrator" });
  const changed = await withPlatformContext(prisma, async tx => {
    const previous = await tx.$queryRawUnsafe<Array<{assignedToUserId:string|null}>(`SELECT "assignedToUserId" FROM "OperationsAlertOutbox" WHERE "id"=$1 AND "resolvedAt" IS NULL FOR UPDATE`, req.params.alertId);
    const rows = previous.length ? await tx.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "assignedToUserId"=$2,"updatedAt"=NOW() WHERE "id"=$1 AND "resolvedAt" IS NULL`, req.params.alertId, userId) : 0;
    if (rows) {
      await tx.$executeRawUnsafe(`INSERT INTO "OperationsAlertLifecycleHistory" ("id","alertId","action","actorUserId","comment","previousValue","newValue") VALUES ($1,$2,'ASSIGN',$3,NULL,$4::jsonb,$5::jsonb)`, `oalh_${randomBytes(12).toString("hex")}`, req.params.alertId, req.auth!.userId, JSON.stringify({ assignedToUserId: previous[0].assignedToUserId }), JSON.stringify({ assignedToUserId: userId }));
      await tx.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.operations_alert.assigned", resourceType: "OperationsAlertOutbox", resourceId: req.params.alertId, outcome: "SUCCESS", metadata: { assignedToUserId: userId } } });
    }
    return rows.length;
  });
  if (!changed) return res.status(404).json({ error: "Alert not found or already resolved" });
  return res.json({ data: { assignedToUserId: userId } });
}));

platformRouter.post("/operations-alerts/:alertId/resolve", asyncRoute(async (req, res) => {
  const note = typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 1000) : "";
  if (note.length < 10) return res.status(400).json({ error: "Resolution note must be at least 10 characters" });
  const changed = await withPlatformContext(prisma, async tx => {
    const rows = await tx.$queryRawUnsafe<Array<{id:string}>>(`UPDATE "OperationsAlertOutbox" SET "resolvedAt"=NOW(),"resolvedByUserId"=$2,"resolutionNote"=$3,"updatedAt"=NOW() WHERE "id"=$1 AND "resolvedAt" IS NULL RETURNING "id"`, req.params.alertId, req.auth!.userId, note);
    if (rows.length) {
      await tx.$executeRawUnsafe(`INSERT INTO "OperationsAlertLifecycleHistory" ("id","alertId","action","actorUserId","comment","newValue") VALUES ($1,$2,'RESOLVE',$3,$4,$5::jsonb)`, `oalh_${randomBytes(12).toString("hex")}`, req.params.alertId, req.auth!.userId, note, JSON.stringify({ resolvedAt: new Date().toISOString() }));
      await tx.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.operations_alert.resolved", resourceType: "OperationsAlertOutbox", resourceId: req.params.alertId, outcome: "SUCCESS" } });
    }
    return rows.length;
  });
  if (!changed) return res.status(404).json({ error: "Alert not found or already resolved" });
  return res.json({ data: { resolved: true } });
}));

platformRouter.get("/operations-alerts/:alertId/lifecycle-history", asyncRoute(async (req, res) => {
  const rows = await withPlatformContext(prisma, async tx => tx.$queryRawUnsafe<Array<Record<string, unknown>>>(`SELECT "action","actorUserId","comment","previousValue","newValue","createdAt" FROM "OperationsAlertLifecycleHistory" WHERE "alertId"=$1 ORDER BY "createdAt" DESC LIMIT 100`, req.params.alertId));
  return res.json({ data: rows });
}));


// P445: SLA deadline update and follow-up reminders. Deadlines are explicitly managed by admins.
platformRouter.post("/operations-alerts/:alertId/sla", asyncRoute(async (req, res) => {
  const dueAt = typeof req.body?.dueAt === "string" ? new Date(req.body.dueAt) : null;
  if (!dueAt || Number.isNaN(dueAt.getTime()) || dueAt.getTime() <= Date.now()) return res.status(400).json({ error: "dueAt must be a valid future timestamp" });
  const rows = await withPlatformContext(prisma, async tx => tx.$queryRawUnsafe<Array<{id:string}>>(`UPDATE "OperationsAlertOutbox" SET "slaDueAt"=$2,"updatedAt"=NOW() WHERE "id"=$1 AND "resolvedAt" IS NULL RETURNING "id"`, req.params.alertId, dueAt));
  if (!rows.length) return res.status(404).json({ error: "Alert not found or already resolved" });
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.operations_alert.sla_updated", resourceType: "OperationsAlertOutbox", resourceId: req.params.alertId, outcome: "SUCCESS", metadata: { dueAt: dueAt.toISOString() } } });
  return res.json({ data: { slaDueAt: dueAt.toISOString() } });
}));

platformRouter.get("/operations-alerts/ownership-workload", asyncRoute(async (_req, res) => {
  const rows = await withPlatformContext(prisma, async tx => tx.$queryRawUnsafe<Array<Record<string, unknown>>>(`SELECT "assignedToUserId",COUNT(*)::int AS "openCount",COUNT(*) FILTER (WHERE "slaDueAt" < NOW())::int AS "overdueCount" FROM "OperationsAlertOutbox" WHERE "resolvedAt" IS NULL AND "assignedToUserId" IS NOT NULL GROUP BY "assignedToUserId" ORDER BY "overdueCount" DESC,"openCount" DESC`));
  return res.json({ data: rows });
}));

platformRouter.post("/operations-alerts/:alertId/follow-up", asyncRoute(async (req, res) => {
  const comment = typeof req.body?.note === "string" ? req.body.note.trim().slice(0,500) : null;
  const rows = await withPlatformContext(prisma, async tx => tx.$queryRawUnsafe<Array<{id:string}>>(`UPDATE "OperationsAlertOutbox" SET "followUpReminderAt"=NOW(),"updatedAt"=NOW() WHERE "id"=$1 AND "resolvedAt" IS NULL AND "followUpReminderAt" IS NULL RETURNING "id"`, req.params.alertId));
  if (!rows.length) return res.status(409).json({ error: "Follow-up reminder already recorded, alert is resolved, or alert not found" });
  await withPlatformContext(prisma, async tx => tx.$executeRawUnsafe(`INSERT INTO "OperationsAlertLifecycleHistory" ("id","alertId","action","actorUserId","comment","newValue") VALUES ($1,$2,'FOLLOW_UP',$3,$4,$5::jsonb)`, `oalh_${randomBytes(12).toString("hex")}`, req.params.alertId, req.auth!.userId, comment, JSON.stringify({ followUpReminderAt: new Date().toISOString() })));
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.operations_alert.follow_up_recorded", resourceType: "OperationsAlertOutbox", resourceId: req.params.alertId, outcome: "SUCCESS" } });
  return res.json({ data: { followUpRecorded: true } });
}));

platformRouter.post("/operations-alerts/:alertId/retry", asyncRoute(async (req, res) => {
  const changed = await withPlatformContext(prisma, async tx => {
    const count = await tx.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "status"='RETRY',"nextAttemptAt"=NOW(),"lastErrorCode"=NULL,"updatedAt"=NOW() WHERE "id"=$1 AND "status"='RETRY'`, req.params.alertId);
    if (count) await tx.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "platform.operations_alert.delivery_retry_requested", resourceType: "OperationsAlertOutbox", resourceId: req.params.alertId, outcome: "SUCCESS" } });
    return count;
  });
  if (!changed) return res.status(409).json({ error: "Alert is not eligible for retry" });
  return res.json({ data: { retryQueued: true } });
}));


export const tenantPublicRouter = Router();
tenantPublicRouter.get("/tenant-context", asyncRoute(async (req, res) => {
  const rawHost = String(req.get("host") || "").split(":")[0].toLowerCase().replace(/\.$/, "");
  const hostname = normalizeHostname(rawHost);
  if (!hostname) return res.status(404).json({ error: "Tenant domain not found" });
  const resolved = await withPlatformContext(prisma, async tx => {
    const domain = await tx.tenantCustomDomain.findFirst({ where: { hostname, status: "ACTIVE" }, select: { organizationId: true } });
    if (!domain) return null;
    const [organization, branding] = await Promise.all([
      tx.organization.findFirst({ where: { id: domain.organizationId, isActive: true }, select: { id: true, name: true, slug: true, timezone: true } }),
      tx.tenantBranding.findUnique({ where: { organizationId: domain.organizationId }, select: { brandName: true, primaryColor: true, secondaryColor: true, logoUrl: true, faviconUrl: true, supportEmail: true, supportUrl: true, loginMessage: true } })
    ]);
    const schools = organization ? await tx.school.findMany({ where: { organizationId: domain.organizationId, isActive: true, lifecycleStatus: "ACTIVE" }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }) : [];
    return organization ? { organization, branding, schools } : null;
  });
  if (!resolved) return res.status(404).json({ error: "No active tenant is mapped to this domain" });
  return res.json({ data: resolved });
}));
