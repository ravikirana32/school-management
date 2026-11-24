import { Router } from "express";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext, withIdentityContext } from "../auth/tenant-context.js";
import { hasOrganizationAdminAccess } from "./organization.authorization.js";
import { env } from "../../config/env.js";
import {
  onboardOrganizationSchema, createSchoolSchema, inviteMemberSchema, acceptInvitationSchema
} from "./organization.schemas.js";

export const organizationRouter = Router();
organizationRouter.use(authenticate);

function asyncRoute(fn: (req: any, res: any) => Promise<unknown>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);
}
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
function opaqueToken() {
  return randomBytes(48).toString("base64url");
}

organizationRouter.post("/onboard", asyncRoute(async (req, res) => {
  const parsed = onboardOrganizationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid organization onboarding details" });
  const userId = req.auth!.userId;
  const data = parsed.data;
  const result = await prisma.$transaction(async tx => {
    const organization = await tx.organization.create({
      data: {
        name: data.organizationName, slug: data.organizationSlug, country: data.country,
        timezone: data.timezone, isActive: true, lifecycleStatus: "ACTIVE"
      }
    });
    await tx.$executeRaw`SELECT set_config('app.current_organization_id', ${organization.id}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_school_id', '', true)`;
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_admin', 'false', true)`;
    const school = await tx.school.create({
      data: {
        organizationId: organization.id, name: data.schoolName, code: data.schoolCode,
        timezone: data.timezone, isActive: true, lifecycleStatus: "ACTIVE"
      }
    });
    await tx.organizationMembership.create({
      data: { userId, organizationId: organization.id, status: "ACTIVE", joinedAt: new Date() }
    });
    await tx.schoolMembership.create({
      data: { userId, organizationId: organization.id, schoolId: school.id, status: "ACTIVE", joinedAt: new Date() }
    });
    const orgOwnerRole = await tx.role.upsert({
      where: { key: "ORG_OWNER" },
      create: { key: "ORG_OWNER", name: "Organization Owner", scopeType: "ORGANIZATION", isSystem: true },
      update: {}
    });
    const schoolAdminRole = await tx.role.upsert({
      where: { key: "SCHOOL_ADMIN" },
      create: { key: "SCHOOL_ADMIN", name: "School Administrator", scopeType: "SCHOOL", isSystem: true },
      update: {}
    });
    const schoolPermissions = await tx.permission.findMany({ select: { id: true } });
    if (schoolPermissions.length) {
      await tx.rolePermission.createMany({
        data: schoolPermissions.map(permission => ({ roleId: schoolAdminRole.id, permissionId: permission.id })),
        skipDuplicates: true,
      });
    }
    await tx.userRoleAssignment.createMany({ data: [
      { userId, roleId: orgOwnerRole.id, scopeType: "ORGANIZATION", organizationId: organization.id, assignedBy: userId },
      { userId, roleId: schoolAdminRole.id, scopeType: "SCHOOL", organizationId: organization.id, schoolId: school.id, assignedBy: userId }
    ] });
    await tx.auditLog.create({
      data: {
        actorUserId: userId, organizationId: organization.id, schoolId: school.id,
        action: "organization.onboarded", resourceType: "Organization",
        resourceId: organization.id, outcome: "SUCCESS"
      }
    });
    return { organization, school };
  });
  return res.status(201).json({ data: result });
}));

organizationRouter.patch("/:organizationId/status", asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const organizationId = req.params.organizationId;
  if (!(await hasOrganizationAdminAccess(userId, organizationId))) {
    return res.status(403).json({ error: "Organization administrator access required" });
  }
  const status = req.body?.status;
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  const allowed = ["ACTIVE", "SUSPENDED", "DEACTIVATED", "ARCHIVED"];
  if (!allowed.includes(status) || reason.length < 8 || reason.length > 500) {
    return res.status(400).json({ error: "A valid organization status and reason are required" });
  }
  const updated = await withTenantContext(prisma, { organizationId, userId }, async tx => {
    const current = await tx.organization.findFirst({ where: { id: organizationId } });
    if (!current) return null;
    const transitions: Record<string, string[]> = {
      PROVISIONING: ["ACTIVE", "SUSPENDED"], ACTIVE: ["SUSPENDED", "DEACTIVATED"],
      SUSPENDED: ["ACTIVE", "DEACTIVATED"], DEACTIVATED: ["ARCHIVED"], ARCHIVED: []
    };
    if (!(transitions[current.lifecycleStatus] || []).includes(status)) {
      throw Object.assign(new Error(`Invalid organization lifecycle transition: ${current.lifecycleStatus} -> ${status}`), { status: 409 });
    }
    const organization = await tx.organization.update({
      where: { id: organizationId },
      data: { lifecycleStatus: status as any, isActive: status === "ACTIVE" }
    });
    if (status === "SUSPENDED" || status === "DEACTIVATED" || status === "ARCHIVED") {
      await tx.school.updateMany({
        where: { organizationId, lifecycleStatus: { not: "CLOSED" } },
        data: { lifecycleStatus: "SUSPENDED", isActive: false }
      });
    } else if (status === "ACTIVE") {
      await tx.school.updateMany({
        where: { organizationId, lifecycleStatus: "SUSPENDED" },
        data: { lifecycleStatus: "ACTIVE", isActive: true }
      });
    }
    await tx.tenantLifecycleEvent.create({ data: {
      organizationId, fromStatus: current.lifecycleStatus, toStatus: status as any,
      reason, performedBy: userId, correlationId: req.get("x-request-id") || undefined
    }});
    await tx.auditLog.create({ data: {
      actorUserId: userId, organizationId, action: "organization.lifecycle.changed",
      resourceType: "Organization", resourceId: organizationId, outcome: "SUCCESS",
      metadata: { fromStatus: current.lifecycleStatus, toStatus: status, reason }
    }});
    return organization;
  });
  if (!updated) return res.status(404).json({ error: "Organization not found" });
  return res.json({ data: updated });
}));

organizationRouter.get("/", asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const ids = await withIdentityContext(prisma, userId, async tx => {
    const memberships = await tx.organizationMembership.findMany({
      where: { userId, status: "ACTIVE" }, select: { organizationId: true }
    });
    return memberships.map(m => m.organizationId);
  });
  const organizations = await withIdentityContext(prisma, userId, tx => tx.organization.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true, name: true, slug: true, country: true, timezone: true, lifecycleStatus: true }
  }));
  return res.json({ data: organizations });
}));

// Authenticated school discovery for the School Admin shell. Only active memberships
// are returned; callers never supply organization or school identifiers.
organizationRouter.get("/me/schools", asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const memberships = await withIdentityContext(prisma, userId, tx => tx.schoolMembership.findMany({
    where: { userId, status: "ACTIVE" },
    select: { organizationId: true, schoolId: true },
    orderBy: { createdAt: "asc" },
    take: 200
  }));
  const data = [];
  for (const membership of memberships) {
    const item = await withTenantContext(prisma, {
      organizationId: membership.organizationId,
      schoolId: membership.schoolId,
      userId
    }, async tx => {
      const [organizationMembership, organization, school] = await Promise.all([
        tx.organizationMembership.findFirst({ where: { userId, organizationId: membership.organizationId, status: "ACTIVE" }, select: { id: true } }),
        tx.organization.findFirst({ where: { id: membership.organizationId, isActive: true }, select: { id: true, name: true, slug: true } }),
        tx.school.findFirst({ where: { id: membership.schoolId, organizationId: membership.organizationId, isActive: true, lifecycleStatus: "ACTIVE" }, select: { id: true, name: true, code: true, timezone: true } })
      ]);
      if (!organizationMembership || !organization || !school) return null;
      return { organization, school };
    });
    if (item) data.push(item);
  }
  return res.json({ data, meta: { limit: 200, truncated: memberships.length === 200 } });
}));

organizationRouter.get("/:organizationId/schools", asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const schools = await withTenantContext(prisma, { organizationId: req.params.organizationId, userId }, async tx => {
    const membership = await tx.organizationMembership.findFirst({
      where: { userId, organizationId: req.params.organizationId, status: "ACTIVE" }
    });
    if (!membership) return null;
    return tx.school.findMany({
      where: { organizationId: req.params.organizationId, isActive: true }, orderBy: { name: "asc" }
    });
  });
  if (!schools) return res.status(403).json({ error: "Organization membership required" });
  return res.json({ data: schools });
}));

organizationRouter.post("/:organizationId/schools", asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const organizationId = req.params.organizationId;
  if (!(await hasOrganizationAdminAccess(userId, organizationId))) {
    return res.status(403).json({ error: "Organization administrator access required" });
  }
  const parsed = createSchoolSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid school details" });
  const school = await withTenantContext(prisma, { organizationId, userId }, tx =>
    tx.school.create({ data: { ...parsed.data, organizationId, isActive: true, lifecycleStatus: "ACTIVE" } })
  );
  await prisma.auditLog.create({
    data: {
      actorUserId: userId, organizationId, schoolId: school.id,
      action: "organization.school.created", resourceType: "School",
      resourceId: school.id, outcome: "SUCCESS"
    }
  });
  return res.status(201).json({ data: school });
}));

organizationRouter.post("/:organizationId/invitations", asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const organizationId = req.params.organizationId;
  if (!(await hasOrganizationAdminAccess(userId, organizationId))) {
    return res.status(403).json({ error: "Organization administrator access required" });
  }
  const parsed = inviteMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid invitation details" });
  if (parsed.data.schoolId) {
    const school = await withTenantContext(prisma, { organizationId, schoolId: parsed.data.schoolId, userId }, tx =>
      tx.school.findFirst({ where: { id: parsed.data.schoolId, organizationId, isActive: true } })
    );
    if (!school) return res.status(404).json({ error: "School not found in this organization" });
  }
  const normalizedEmail = parsed.data.email.toLowerCase();
  const existingPending = await withTenantContext(prisma, { organizationId, userId, schoolId: parsed.data.schoolId }, tx => tx.organizationInvitation.findFirst({
    where: { organizationId, schoolId: parsed.data.schoolId ?? null, email: normalizedEmail, roleKey: parsed.data.roleKey, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, expiresAt: true }
  }));
  if (existingPending) return res.status(409).json({ error: "A pending invitation already exists for this email, role and school", data: { invitationId: existingPending.id, expiresAt: existingPending.expiresAt } });
  // Invitations are unusable without a delivery channel because only the token hash
  // is stored. Fail closed before creating an orphaned invitation.
  if (!env.NOTIFICATION_EMAIL_PROVIDER_URL || !env.NOTIFICATION_EMAIL_PROVIDER_TOKEN || !env.NOTIFICATION_EMAIL_FROM || !env.ORGANIZATION_ADMIN_INVITATION_BASE_URL) {
    return res.status(503).json({ error: "Organization invitation delivery is not configured. Configure the notification email provider and organization admin invitation URL before inviting members." });
  }
  const token = opaqueToken();
  const invitation = await prisma.organizationInvitation.create({
    data: {
      organizationId, schoolId: parsed.data.schoolId, email: parsed.data.email,
      roleKey: parsed.data.roleKey, tokenHash: hashToken(token), invitedBy: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  const invitationUrl = `${env.ORGANIZATION_ADMIN_INVITATION_BASE_URL.replace(/\/+$/, "")}/accept-invitation#token=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(env.NOTIFICATION_EMAIL_PROVIDER_URL, {
      method: "POST", signal: AbortSignal.timeout(20_000),
      headers: { "content-type": "application/json", authorization: `Bearer ${env.NOTIFICATION_EMAIL_PROVIDER_TOKEN}`, "idempotency-key": invitation.id },
      body: JSON.stringify({ from: env.NOTIFICATION_EMAIL_FROM, to: parsed.data.email, subject: "Your school organization invitation", template: "organization-invitation", variables: { invitationUrl, email: parsed.data.email, role: parsed.data.roleKey, expiresAt: invitation.expiresAt.toISOString() }, metadata: { invitationId: invitation.id, organizationId, schoolId: parsed.data.schoolId ?? null } })
    });
    if (!response.ok) throw new Error(`Email provider returned HTTP ${response.status}`);
  } catch (error) {
    // Avoid leaving a pending invitation whose secret was never delivered.
    await prisma.organizationInvitation.updateMany({ where: { id: invitation.id, acceptedAt: null }, data: { revokedAt: new Date() } });
    await prisma.auditLog.create({ data: { actorUserId: userId, organizationId, schoolId: parsed.data.schoolId, action: "organization.invitation.delivery_failed", resourceType: "OrganizationInvitation", resourceId: invitation.id, outcome: "FAILURE", metadata: { providerFailure: error instanceof Error ? error.name : "UnknownError" } } });
    return res.status(502).json({ error: "Invitation was not delivered. The invitation was safely revoked; please retry after checking email provider configuration." });
  }
  await prisma.auditLog.create({
    data: {
      actorUserId: userId, organizationId, schoolId: parsed.data.schoolId,
      action: "organization.invitation.created", resourceType: "OrganizationInvitation",
      resourceId: invitation.id, outcome: "SUCCESS",
      metadata: { email: parsed.data.email, roleKey: parsed.data.roleKey, delivery: "SENT" }
    }
  });
  return res.status(202).json({ data: { invitationId: invitation.id, status: "SENT" }, message: "Invitation email sent. The invitation token is never returned by the API." });
}));

// P389: organization invitation lifecycle visibility and revocation. Tokens are never returned.
organizationRouter.get("/:organizationId/invitations", asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const organizationId = req.params.organizationId;
  if (!(await hasOrganizationAdminAccess(userId, organizationId))) return res.status(403).json({ error: "Organization administrator access required" });
  const rows = await withTenantContext(prisma, { organizationId, userId }, tx => tx.organizationInvitation.findMany({
    where: { organizationId }, orderBy: { createdAt: "desc" }, take: 100,
    select: { id: true, schoolId: true, email: true, roleKey: true, invitedBy: true, expiresAt: true, acceptedAt: true, revokedAt: true, createdAt: true }
  }));
  const now = new Date();
  const data = rows.map(row => ({ ...row, status: row.acceptedAt ? "ACCEPTED" : row.revokedAt ? "REVOKED" : row.expiresAt <= now ? "EXPIRED" : "PENDING" }));
  return res.json({ data, meta: { limit: 100, truncated: rows.length === 100 } });
}));

organizationRouter.post("/:organizationId/invitations/:invitationId/revoke", asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const organizationId = req.params.organizationId;
  if (!(await hasOrganizationAdminAccess(userId, organizationId))) return res.status(403).json({ error: "Organization administrator access required" });
  const changed = await withTenantContext(prisma, { organizationId, userId }, async tx => {
    const invitation = await tx.organizationInvitation.findFirst({ where: { id: req.params.invitationId, organizationId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } } });
    if (!invitation) return null;
    const updated = await tx.organizationInvitation.update({ where: { id: invitation.id }, data: { revokedAt: new Date() } });
    await tx.auditLog.create({ data: { actorUserId: userId, organizationId, schoolId: invitation.schoolId, action: "organization.invitation.revoked", resourceType: "OrganizationInvitation", resourceId: invitation.id, outcome: "SUCCESS" } });
    return updated.id;
  });
  if (!changed) return res.status(404).json({ error: "Active invitation not found" });
  return res.status(204).send();
}));

organizationRouter.post("/invitations/accept", asyncRoute(async (req, res) => {
  const parsed = acceptInvitationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid invitation token" });
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { id: true, email: true } });
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const tokenHash = hashToken(parsed.data.token);
  const result = await prisma.$transaction(async tx => {
    // Serialize acceptance attempts on this token so duplicate submissions cannot
    // create duplicate membership/role assignment records.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${tokenHash}, 0))`;
    const invitation = await tx.organizationInvitation.findUnique({ where: { tokenHash } });
    if (!invitation || invitation.email !== user.email || invitation.acceptedAt || invitation.revokedAt || invitation.expiresAt <= new Date()) return null;
    await tx.$executeRaw`SELECT set_config('app.current_organization_id', ${invitation.organizationId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_school_id', ${invitation.schoolId ?? ""}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${user.id}, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_admin', 'false', true)`;
    const orgMembership = await tx.organizationMembership.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: invitation.organizationId } },
      create: { userId: user.id, organizationId: invitation.organizationId, status: "ACTIVE", joinedAt: new Date() },
      update: { status: "ACTIVE", joinedAt: new Date() }
    });
    if (invitation.schoolId) {
      await tx.schoolMembership.upsert({
        where: { userId_schoolId: { userId: user.id, schoolId: invitation.schoolId } },
        create: { userId: user.id, organizationId: invitation.organizationId, schoolId: invitation.schoolId, status: "ACTIVE", joinedAt: new Date() },
        update: { status: "ACTIVE", joinedAt: new Date() }
      });
    }
    const scopeType = invitation.schoolId ? "SCHOOL" : "ORGANIZATION";
    const role = await tx.role.upsert({
      where: { key: invitation.roleKey },
      create: { key: invitation.roleKey, name: invitation.roleKey.replaceAll("_", " "), scopeType, isSystem: true },
      update: {}
    });
    const existingRoleAssignment = await tx.userRoleAssignment.findFirst({
      where: { userId: user.id, roleId: role.id, scopeType, organizationId: invitation.organizationId, schoolId: invitation.schoolId }
    });
    if (!existingRoleAssignment) await tx.userRoleAssignment.create({
      data: {
        userId: user.id, roleId: role.id, scopeType, organizationId: invitation.organizationId,
        schoolId: invitation.schoolId, assignedBy: invitation.invitedBy
      }
    });
    const consumed = await tx.organizationInvitation.updateMany({ where: { id: invitation.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } }, data: { acceptedAt: new Date() } });
    if (consumed.count !== 1) throw Object.assign(new Error("Invitation was already consumed or is no longer active"), { status: 409 });
    await tx.auditLog.create({
      data: {
        actorUserId: user.id, organizationId: invitation.organizationId, schoolId: invitation.schoolId,
        action: "organization.invitation.accepted", resourceType: "OrganizationInvitation",
        resourceId: invitation.id, outcome: "SUCCESS"
      }
    });
    return orgMembership;
  });
  if (!result) return res.status(400).json({ error: "Invitation is invalid, expired, revoked or not intended for this account" });
  return res.json({ data: { accepted: true, organizationId: result.organizationId } });
}));

organizationRouter.patch("/:organizationId/schools/:schoolId/status", asyncRoute(async (req, res) => {
  const userId = req.auth!.userId;
  const organizationId = req.params.organizationId;
  const schoolId = req.params.schoolId;
  if (!(await hasOrganizationAdminAccess(userId, organizationId))) return res.status(403).json({ error: "Organization administrator access required" });
  const status = req.body?.status;
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  if (!["ACTIVE", "SUSPENDED", "CLOSED"].includes(status) || reason.length < 8 || reason.length > 500) {
    return res.status(400).json({ error: "A valid school status and reason are required" });
  }
  const updated = await withTenantContext(prisma, { organizationId, schoolId, userId }, async tx => {
    const existing = await tx.school.findFirst({ where: { id: schoolId, organizationId } });
    if (!existing) return null;
    return tx.school.update({
      where: { id: schoolId },
      data: { isActive: status === "ACTIVE", lifecycleStatus: status }
    });
  });
  if (!updated) return res.status(404).json({ error: "School not found" });
  await prisma.auditLog.create({
    data: {
      actorUserId: userId, organizationId, schoolId,
      action: "organization.school.status_changed", resourceType: "School",
      resourceId: schoolId, outcome: "SUCCESS", metadata: { status, reason }
    }
  });
  return res.json({ data: updated });
}));
