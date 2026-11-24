import { randomUUID } from "node:crypto";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasActiveSchoolMembership } from "./school-config.authorization.js";
import {
  academicTermSchema, academicYearSchema, calendarEventSchema, calendarSchema,
  dayConfigurationSchema, schoolPolicySchema, schoolProfileSchema
} from "./school-config.schemas.js";

export const schoolConfigRouter = Router();
schoolConfigRouter.use(authenticate);

function asyncRoute(fn: (req: any, res: any) => Promise<unknown>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);
}
async function scope(req: any, res: any) {
  const organizationId = String(req.params.organizationId || "");
  const schoolId = String(req.params.schoolId || "");
  const userId = req.auth!.userId;
  if (!await hasActiveSchoolMembership(userId, organizationId, schoolId)) {
    res.status(403).json({ error: "Active school membership required" });
    return null;
  }
  return { organizationId, schoolId, userId };
}
async function requirePermission(scopeValue: { organizationId: string; schoolId: string; userId: string }, res: any, permission: string) {
  if (!await hasSchoolPermission(scopeValue.userId, scopeValue.organizationId, scopeValue.schoolId, permission)) {
    res.status(403).json({ error: `Missing required school permission: ${permission}` });
    return false;
  }
  return true;
}
async function hasAcademicConfigurationEntitlement(organizationId: string, schoolId: string) {
  return withTenantContext(prisma, { organizationId, schoolId }, async tx => {
    const subscription = await tx.organizationSubscription.findFirst({
      where: { organizationId, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] }, currentPeriodEndsAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    });
    if (!subscription) return false;
    const plan = await tx.subscriptionPlan.findUnique({ where: { id: subscription.planId } });
    const entitlements = (plan?.entitlements ?? {}) as Record<string, unknown>;
    return entitlements.academicConfiguration === true;
  });
}
function toDate(value: string) { return new Date(`${value}T00:00:00.000Z`); }

// P403: persisted campus inheritance records (raw SQL avoids requiring client regeneration).
const campusConfigScopes = ["profile", "working", "policies"] as const;
function campusInheritanceErrors(doc: any, campusId: string): string[] {
  const errors: string[] = [];
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return ["Inheritance document must be an object."];
  if (doc.format !== "school-saas-campus-overrides" || doc.version !== 1) errors.push("Unsupported inheritance document format/version.");
  if (doc.campusId !== campusId) errors.push("campusId must match the route.");
  if (!campusId.trim() || campusId.length > 120) errors.push("Invalid campus identifier.");
  if (doc.parentCampusId !== undefined && doc.parentCampusId !== null && (typeof doc.parentCampusId !== "string" || !doc.parentCampusId.trim() || doc.parentCampusId.length > 120)) errors.push("parentCampusId must be null or a valid identifier.");
  if (doc.parentCampusId === campusId) errors.push("Campus cannot inherit from itself.");
  if (!Array.isArray(doc.inheritedScopes)) errors.push("inheritedScopes must be an array.");
  else { const seen = new Set(); for (const scope of doc.inheritedScopes) { if (!campusConfigScopes.includes(scope)) errors.push(`Unsupported scope ${String(scope)}.`); else if (seen.has(scope)) errors.push(`Duplicate scope ${scope}.`); else seen.add(scope); } }
  if (!doc.overrides || typeof doc.overrides !== "object" || Array.isArray(doc.overrides)) errors.push("overrides must be an object.");
  else for (const key of Object.keys(doc.overrides)) if (!campusConfigScopes.includes(key as any)) errors.push(`Unsupported override scope ${key}.`);
  return errors;
}
// P405: resolve persisted inheritance documents into an effective override view for a campus.
function mergeCampusOverride(base: any, override: any): any {
  if (!base || typeof base !== "object" || Array.isArray(base) || !override || typeof override !== "object" || Array.isArray(override)) return override;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) result[key] = mergeCampusOverride(result[key], value);
  return result;
}
function resolvePersistedCampusInheritance(campusId: string, rows: Array<{ campusId: string; parentCampusId: string | null; configDocument: any }>) {
  const errors: string[] = [];
  const byId = new Map<string, any>();
  for (const row of rows) {
    if (byId.has(row.campusId)) errors.push(`Duplicate campus document ${row.campusId}.`);
    else byId.set(row.campusId, row.configDocument);
  }
  if (!byId.has(campusId)) errors.push(`Campus ${campusId} was not found.`);
  const chain: string[] = []; const visited = new Set<string>(); let cursor: string | null = campusId;
  while (cursor && !errors.length) {
    if (visited.has(cursor)) { errors.push(`Inheritance cycle detected at campus ${cursor}.`); break; }
    visited.add(cursor); chain.push(cursor);
    const doc = byId.get(cursor);
    if (!doc) { errors.push(`Parent campus ${cursor} was not found.`); break; }
    cursor = doc.parentCampusId ?? null;
  }
  if (errors.length) return { valid: false, errors, chain };
  const effectiveOverrides: Record<string, unknown> = {};
  for (const id of [...chain].reverse()) {
    const doc = byId.get(id); const overrides = doc?.overrides ?? {};
    for (const scope of campusConfigScopes) {
      if (overrides[scope] === undefined) continue;
      effectiveOverrides[scope] = Array.isArray(doc.inheritedScopes) && doc.inheritedScopes.includes(scope)
        ? mergeCampusOverride(effectiveOverrides[scope], overrides[scope])
        : overrides[scope];
    }
  }
  return { valid: true, errors: [], chain: [...chain].reverse(), effectiveOverrides };
}
// P407: tenant-scoped campus registry CRUD foundation.
function validateCampusInput(body: any) {
  const errors: string[] = [];
  const campusCode = typeof body?.campusCode === "string" ? body.campusCode.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = body?.description == null ? null : String(body.description).trim();
  const status = body?.status ?? "ACTIVE";
  if (!campusCode || campusCode.length > 40) errors.push("campusCode is required and must be at most 40 characters.");
  if (!name || name.length > 160) errors.push("name is required and must be at most 160 characters.");
  if (description !== null && description.length > 500) errors.push("description must be at most 500 characters.");
  if (!["ACTIVE", "INACTIVE"].includes(status)) errors.push("status must be ACTIVE or INACTIVE.");
  return { errors, campusCode, name, description, status, isMain: body?.isMain === true };
}
schoolConfigRouter.get("/:organizationId/:schoolId/campus-registry", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const rows = await withTenantContext(prisma, s, tx => tx.$queryRaw`SELECT "id","campusCode","name","description","status","isMain","createdAt","updatedAt" FROM "SchoolCampus" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "status" <> 'ARCHIVED' ORDER BY "isMain" DESC,"name" ASC`);
  return res.json({ data: rows });
}));
schoolConfigRouter.post("/:organizationId/:schoolId/campus-registry", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const input = validateCampusInput(req.body); if (input.errors.length) return res.status(400).json({ error: "Invalid campus", details: input.errors });
  const id = randomUUID();
  const result = await withTenantContext(prisma, s, async tx => {
    if (input.isMain) await tx.$executeRaw`UPDATE "SchoolCampus" SET "isMain"=FALSE,"updatedAt"=CURRENT_TIMESTAMP WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "status"='ACTIVE'`;
    return tx.$executeRaw`INSERT INTO "SchoolCampus" ("id","organizationId","schoolId","campusCode","name","description","status","isMain","createdBy","updatedBy","createdAt","updatedAt") VALUES (${id},${s.organizationId},${s.schoolId},${input.campusCode},${input.name},${input.description},${input.status},${input.isMain},${s.userId},${s.userId},CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`;
  });
  await withTenantContext(prisma, s, tx => tx.auditLog.create({ data: { actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"school.campus.created", resourceType:"SchoolCampus", resourceId:id, outcome:"SUCCESS" } }));
  return res.status(201).json({ data: { id, created: Number(result) > 0 } });
}));
schoolConfigRouter.put("/:organizationId/:schoolId/campus-registry/:campusId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const input = validateCampusInput(req.body); if (input.errors.length) return res.status(400).json({ error: "Invalid campus", details: input.errors });
  const campusId = String(req.params.campusId || "");
  const result = await withTenantContext(prisma, s, async tx => {
    const exists = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "SchoolCampus" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "id"=${campusId} AND "status" <> 'ARCHIVED'`;
    if (!exists.length) return 0;
    if (input.isMain) await tx.$executeRaw`UPDATE "SchoolCampus" SET "isMain"=FALSE,"updatedAt"=CURRENT_TIMESTAMP WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "status"='ACTIVE' AND "id" <> ${campusId}`;
    return tx.$executeRaw`UPDATE "SchoolCampus" SET "campusCode"=${input.campusCode},"name"=${input.name},"description"=${input.description},"status"=${input.status},"isMain"=${input.isMain},"updatedBy"=${s.userId},"updatedAt"=CURRENT_TIMESTAMP WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "id"=${campusId} AND "status" <> 'ARCHIVED'`;
  });
  if (!result) return res.status(404).json({ error: "Campus not found" });
  await withTenantContext(prisma, s, tx => tx.auditLog.create({ data: { actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"school.campus.updated", resourceType:"SchoolCampus", resourceId:campusId, outcome:"SUCCESS" } }));
  return res.json({ data: { campusId, updated: Number(result) > 0 } });
}));
schoolConfigRouter.delete("/:organizationId/:schoolId/campus-registry/:campusId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const campusId = String(req.params.campusId || "");
  const result = await withTenantContext(prisma, s, tx => tx.$executeRaw`UPDATE "SchoolCampus" SET "status"='ARCHIVED',"isMain"=FALSE,"updatedBy"=${s.userId},"updatedAt"=CURRENT_TIMESTAMP WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "id"=${campusId} AND "status" <> 'ARCHIVED'`);
  if (!result) return res.status(404).json({ error: "Campus not found" });
  await withTenantContext(prisma, s, tx => tx.auditLog.create({ data: { actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"school.campus.archived", resourceType:"SchoolCampus", resourceId:campusId, outcome:"SUCCESS" } }));
  return res.json({ data: { campusId, archived: Number(result) > 0 } });
}));

schoolConfigRouter.get("/:organizationId/:schoolId/campus-inheritance/effective/:campusId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const campusId = String(req.params.campusId || "");
  const [rows, registry] = await withTenantContext(prisma, s, tx => Promise.all([
    tx.$queryRaw<Array<{ campusId: string; parentCampusId: string | null; configDocument: any }>>`SELECT "campusId", "parentCampusId", "configDocument" FROM "CampusConfigInheritanceRecord" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId}`,
    tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "SchoolCampus" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "status"='ACTIVE'`
  ]));
  if (!registry.some(row => row.id === campusId)) return res.status(404).json({ error: "Active campus registry record not found" });
  const result = resolvePersistedCampusInheritance(campusId, rows);
  if (!result.valid) return res.status(422).json({ error: "Campus inheritance cannot be resolved", details: result.errors, chain: result.chain });
  return res.json({ data: result });
}));
// P406: combine resolved campus overrides with persisted school configuration as a read-only effective view.
schoolConfigRouter.get("/:organizationId/:schoolId/campus-config/effective/:campusId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const campusId = String(req.params.campusId || "");
  const [inheritanceRows, profile, workingDays, policies, campusRegistry] = await withTenantContext(prisma, s, async tx => Promise.all([
    tx.$queryRaw<Array<{ campusId: string; parentCampusId: string | null; configDocument: any }>>`SELECT "campusId", "parentCampusId", "configDocument" FROM "CampusConfigInheritanceRecord" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId}`,
    tx.schoolProfile.findUnique({ where: { schoolId: s.schoolId } }),
    tx.schoolDayConfiguration.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId }, orderBy: { dayOfWeek: "asc" } }),
    tx.schoolPolicy.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId } }),
    tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "SchoolCampus" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "status"='ACTIVE'`
  ]));
  if (!campusRegistry.some(row => row.id === campusId)) return res.status(404).json({ error: "Active campus registry record not found" });
  const resolved = resolvePersistedCampusInheritance(campusId, inheritanceRows);
  if (!resolved.valid) return res.status(422).json({ error: "Campus inheritance cannot be resolved", details: resolved.errors, chain: resolved.chain });
  const overrides = resolved.effectiveOverrides;
  const effective = {
    campusId, chain: resolved.chain,
    profile: overrides.profile === undefined ? profile : mergeCampusOverride(profile, overrides.profile),
    workingDays: overrides.working === undefined ? workingDays : mergeCampusOverride(workingDays, overrides.working),
    policies: overrides.policies === undefined ? Object.fromEntries(policies.map((policy: any) => [policy.policyKey, policy.value])) : mergeCampusOverride(Object.fromEntries(policies.map((policy: any) => [policy.policyKey, policy.value])), overrides.policies)
  };
  return res.json({ data: effective });
}));
schoolConfigRouter.get("/:organizationId/:schoolId/campus-inheritance", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const rows = await withTenantContext(prisma, s, tx => tx.$queryRaw`SELECT \"campusId\", \"parentCampusId\", \"configDocument\", \"updatedBy\", \"createdAt\", \"updatedAt\" FROM \"CampusConfigInheritanceRecord\" ORDER BY \"campusId\"`);
  return res.json({ data: rows });
}));
// P404: prevent a proposed campus parent update from introducing a persisted cycle.
function campusInheritanceCycleErrors(campusId: string, proposedParentId: string | null, rows: Array<{ campusId: string; parentCampusId: string | null }>): string[] {
  const parents = new Map(rows.map(row => [row.campusId, row.parentCampusId]));
  parents.set(campusId, proposedParentId);
  const visited = new Set<string>();
  let cursor: string | null = campusId;
  while (cursor) {
    if (visited.has(cursor)) return [`Inheritance cycle detected at campus ${cursor}.`];
    visited.add(cursor);
    cursor = parents.get(cursor) ?? null;
  }
  return [];
}
schoolConfigRouter.put("/:organizationId/:schoolId/campus-inheritance/:campusId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const campusId = String(req.params.campusId || ""); const doc = req.body?.configDocument ?? req.body; const errors = campusInheritanceErrors(doc, campusId);
  if (errors.length) return res.status(400).json({ error: "Invalid campus inheritance configuration", details: errors });
  // P410: serialize inheritance graph writes per school so concurrent updates cannot
  // validate against the same stale graph and create a cycle.
  const saved = await withTenantContext(prisma, s, async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`campus-inheritance:${s.organizationId}:${s.schoolId}`}))`;
    const [existingRows, registryRows] = await Promise.all([
      tx.$queryRaw<Array<{ campusId: string; parentCampusId: string | null }>>`SELECT "campusId", "parentCampusId" FROM "CampusConfigInheritanceRecord" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId}`,
      tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "SchoolCampus" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} AND "status"='ACTIVE'`
    ]);
    const activeCampusIds = new Set(registryRows.map(row => row.id));
    if (!activeCampusIds.has(campusId)) return { error: "Campus registry record is required before inheritance can be saved", status: 404 };
    if (doc.parentCampusId && !activeCampusIds.has(doc.parentCampusId)) return { error: "Parent campus must exist in the active campus registry", status: 400 };
    const cycleErrors = campusInheritanceCycleErrors(campusId, doc.parentCampusId ?? null, existingRows);
    if (cycleErrors.length) return { error: "Campus inheritance cycle rejected", details: cycleErrors, status: 409 };
    const id = randomUUID();
    const result = await tx.$executeRaw`INSERT INTO "CampusConfigInheritanceRecord" ("id","organizationId","schoolId","campusId","parentCampusId","configDocument","updatedBy","createdAt","updatedAt") VALUES (${id},${s.organizationId},${s.schoolId},${campusId},${doc.parentCampusId ?? null},${JSON.stringify(doc)}::jsonb,${s.userId},CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT ("organizationId","schoolId","campusId") DO UPDATE SET "parentCampusId"=EXCLUDED."parentCampusId", "configDocument"=EXCLUDED."configDocument", "updatedBy"=EXCLUDED."updatedBy", "updatedAt"=CURRENT_TIMESTAMP`;
    return { saved: Number(result) > 0 };
  });
  if ("error" in saved) return res.status(saved.status).json({ error: saved.error, ...(saved.details ? { details: saved.details } : {}) });
  await withTenantContext(prisma, s, tx => tx.auditLog.create({ data: { actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"school.campus.inheritance.saved", resourceType:"CampusConfigInheritanceRecord", resourceId:campusId, outcome:"SUCCESS" } }));
  return res.json({ data: { campusId, saved: saved.saved } });
}));
schoolConfigRouter.delete("/:organizationId/:schoolId/campus-inheritance/:campusId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const campusId = String(req.params.campusId || "");
  const removed = await withTenantContext(prisma, s, tx => tx.$executeRaw`DELETE FROM \"CampusConfigInheritanceRecord\" WHERE \"organizationId\"=${s.organizationId} AND \"schoolId\"=${s.schoolId} AND \"campusId\"=${campusId}`);
  if (removed) await withTenantContext(prisma, s, tx => tx.auditLog.create({ data: { actorUserId:s.userId, organizationId:s.organizationId, schoolId:s.schoolId, action:"school.campus.inheritance.deleted", resourceType:"CampusConfigInheritanceRecord", resourceId:campusId, outcome:"SUCCESS" } }));
  return res.json({ data: { campusId, deleted: removed > 0 } });
}));

// P390: enforce the guided onboarding prerequisites at the API boundary as well
// as in the UI. Checks execute inside the same tenant-scoped transaction as the
// configuration write to avoid relying on client-side gates.
async function onboardingPrerequisites(tx: any, scopeValue: { organizationId: string; schoolId: string }) {
  const [profile, currentYear] = await Promise.all([
    tx.schoolProfile.findUnique({ where: { schoolId: scopeValue.schoolId } }),
    tx.academicYear.findFirst({ where: { organizationId: scopeValue.organizationId, schoolId: scopeValue.schoolId, isCurrent: true, status: "ACTIVE" } })
  ]);
  const profileComplete = Boolean(profile?.displayName?.trim() && profile?.legalName?.trim() && profile?.city?.trim() && profile?.state?.trim());
  return { profileComplete, currentYear: currentYear ?? null };
}

// P377: persist onboarding resume position per tenant school so authorized admins
// can resume the guided workflow across browsers/devices. Completion is still derived.
const onboardingStepKeys = ["profile", "board-profile", "academic-year", "terms", "grade-levels", "rooms", "fee-structures", "calendar", "working-days", "attendance-policy", "grading-policy"] as const;
schoolConfigRouter.get("/:organizationId/:schoolId/onboarding-progress", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const progress = await withTenantContext(prisma, s, tx => tx.schoolOnboardingProgress.findUnique({ where: { organizationId_schoolId: { organizationId: s.organizationId, schoolId: s.schoolId } } }));
  return res.json({ data: { currentStepKey: progress?.currentStepKey ?? "profile", lastSavedAt: progress?.updatedAt ?? null } });
}));
schoolConfigRouter.put("/:organizationId/:schoolId/onboarding-progress", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const currentStepKey = req.body?.currentStepKey;
  if (typeof currentStepKey !== "string" || !onboardingStepKeys.includes(currentStepKey as any)) {
    return res.status(400).json({ error: "Invalid onboarding step key", allowed: onboardingStepKeys });
  }
  const saved = await withTenantContext(prisma, s, tx => tx.schoolOnboardingProgress.upsert({
    where: { organizationId_schoolId: { organizationId: s.organizationId, schoolId: s.schoolId } },
    create: { organizationId: s.organizationId, schoolId: s.schoolId, currentStepKey, lastSavedBy: s.userId },
    update: { currentStepKey, lastSavedBy: s.userId }
  }));
  return res.json({ data: { currentStepKey: saved.currentStepKey, lastSavedAt: saved.updatedAt } });
}));

// P378: task ownership for the guided onboarding checklist. Roster and assignment
// writes are permission-gated and restricted to active members of this school.
const onboardingTaskKeys = onboardingStepKeys;
schoolConfigRouter.get("/:organizationId/:schoolId/onboarding-assignments", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const data = await withTenantContext(prisma, s, async tx => {
    const [memberships, assignments] = await Promise.all([
      tx.schoolMembership.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { userId: true } }),
      tx.schoolOnboardingTaskAssignment.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId }, orderBy: { taskKey: "asc" } })
    ]);
    const ids = memberships.map(m => m.userId);
    const users = ids.length ? await tx.user.findMany({ where: { id: { in: ids }, isActive: true }, select: { id: true, displayName: true, email: true }, orderBy: { displayName: "asc" } }) : [];
    return { members: users, assignments };
  });
  return res.json({ data });
}));
schoolConfigRouter.put("/:organizationId/:schoolId/onboarding-assignments/:taskKey", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const taskKey = String(req.params.taskKey || "");
  if (!onboardingTaskKeys.includes(taskKey as any)) return res.status(400).json({ error: "Invalid onboarding task key", allowed: onboardingTaskKeys });
  const assignedToUserId = req.body?.assignedToUserId;
  if (assignedToUserId !== null && (typeof assignedToUserId !== "string" || !assignedToUserId.trim())) return res.status(400).json({ error: "assignedToUserId must be a user ID or null" });
  const result = await withTenantContext(prisma, s, async tx => {
    if (assignedToUserId === null) {
      await tx.schoolOnboardingTaskAssignment.deleteMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, taskKey } });
      await tx.auditLog.create({ data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, action: "school.onboarding.assignment.removed", resourceType: "SchoolOnboardingTaskAssignment", resourceId: taskKey, outcome: "SUCCESS" } });
      return null;
    }
    const membership = await tx.schoolMembership.findFirst({ where: { userId: assignedToUserId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" } });
    const user = membership ? await tx.user.findFirst({ where: { id: assignedToUserId, isActive: true }, select: { id: true, displayName: true, email: true } }) : null;
    if (!membership || !user) throw Object.assign(new Error("Assignee must be an active member of this school"), { status: 400 });
    const assignment = await tx.schoolOnboardingTaskAssignment.upsert({
      where: { organizationId_schoolId_taskKey: { organizationId: s.organizationId, schoolId: s.schoolId, taskKey } },
      create: { organizationId: s.organizationId, schoolId: s.schoolId, taskKey, assignedToUserId, assignedByUserId: s.userId },
      update: { assignedToUserId, assignedByUserId: s.userId }
    });
    await tx.auditLog.create({ data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, action: "school.onboarding.assignment.updated", resourceType: "SchoolOnboardingTaskAssignment", resourceId: assignment.id, outcome: "SUCCESS", metadata: { taskKey, assignedToUserId } } });
    return { ...assignment, assignee: user };
  });
  return res.json({ data: result });
}));

// P374: server-derived onboarding readiness. This endpoint centralizes the readiness
// calculation so clients do not need to infer completion from multiple API payloads.
schoolConfigRouter.get("/:organizationId/:schoolId/readiness", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const snapshot = await withTenantContext(prisma, s, async tx => {
    const [profile, years, calendars, workingDays, policies, boardProfile, gradeLevels, rooms, feeStructures] = await Promise.all([
      tx.schoolProfile.findUnique({ where: { schoolId: s.schoolId } }),
      tx.academicYear.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId }, orderBy: { startsOn: "desc" } }),
      tx.schoolCalendar.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId } }),
      tx.schoolDayConfiguration.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId } }),
      tx.schoolPolicy.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId } }),
      tx.schoolBoardProfile.findFirst({ where: { organizationId: s.organizationId, schoolId: s.schoolId } }),
      tx.gradeLevel.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, isActive: true } }),
      tx.schoolRoom.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, isActive: true } }),
      tx.feeStructure.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, status: "PUBLISHED" } })
    ]);
    const activeYear = years.find(year => year.isCurrent && year.status === "ACTIVE");
    const terms = activeYear ? await tx.academicTerm.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, academicYearId: activeYear.id } }) : [];
    const checks = [
      { key: "profile", title: "School identity", description: "Display and legal name, city and state are required.", prerequisites: [], remediation: "Open school profile and complete the required identity and location fields.", complete: Boolean(profile?.displayName?.trim() && profile?.legalName?.trim() && profile?.city?.trim() && profile?.state?.trim()) },
      { key: "board-profile", title: "Board affiliation", description: "Select the school board or curriculum framework.", prerequisites: ["profile"], remediation: "Open Board & curriculum and save the school's board affiliation.", complete: Boolean(boardProfile?.boardKey?.trim() && boardProfile?.boardName?.trim()) },
      { key: "academic-year", title: "Active academic year", description: "An academic year must be active and marked current.", prerequisites: ["profile"], remediation: "Create an academic year and activate it as the current year.", complete: Boolean(activeYear) },
      { key: "terms", title: "Academic terms", description: "At least one term must belong to the active academic year.", prerequisites: ["academic-year"], remediation: "Add one or more terms under the active academic year.", complete: terms.length > 0 },
      { key: "grade-levels", title: "Grade levels", description: "At least one active grade or level must be configured for the school.", prerequisites: ["board-profile"], remediation: "Open Board & curriculum and create the school’s grade or level list.", complete: gradeLevels.length > 0 },
      { key: "rooms", title: "School rooms and resources", description: "At least one active classroom or resource room must be configured.", prerequisites: ["profile", "grade-levels"], remediation: "Open Timetable and configure at least one active room or classroom resource.", complete: rooms.length > 0 },
      { key: "fee-structures", title: "Published fee structure", description: "A published fee structure should exist for the current academic year or be school-wide.", prerequisites: ["academic-year", "grade-levels"], remediation: "Open Fees, create the fee components and publish a structure for the current academic year.", complete: feeStructures.some(fee => !fee.academicYearId || fee.academicYearId === activeYear?.id) },
      { key: "calendar", title: "Default school calendar", description: "A school calendar must be configured as the default.", prerequisites: ["profile", "academic-year"], remediation: "Create or select a school calendar and mark it default.", complete: calendars.some(calendar => calendar.isDefault) },
      { key: "working-days", title: "Working days", description: "At least five day configurations and one working day are required.", prerequisites: ["profile"], remediation: "Review weekly operating days and save at least five day entries, including a working day.", complete: workingDays.length >= 5 && workingDays.some(day => day.isWorkingDay) },
      { key: "attendance-policy", title: "Attendance policy", description: "An attendance policy record must exist.", prerequisites: ["profile", "academic-year"], remediation: "Configure and save the school's attendance policy.", complete: policies.some(policy => policy.policyKey === "attendance") },
      { key: "grading-policy", title: "Grading policy", description: "A grading policy record must exist.", prerequisites: ["profile", "academic-year", "grade-levels"], remediation: "Configure and save the school's grading policy after academic year and grade levels are set.", complete: policies.some(policy => policy.policyKey === "grading") }
    ];
    // P392: expose dependency-aware orchestration state so clients can present
    // blocked, actionable, and completed setup steps consistently from server data.
    const completeKeys = new Set(checks.filter(check => check.complete).map(check => check.key));
    const orchestratedChecks = checks.map(check => {
      const blockedBy = check.prerequisites.filter(key => !completeKeys.has(key));
      return { ...check, blockedBy, status: check.complete ? "COMPLETE" : blockedBy.length ? "BLOCKED" : "ACTIONABLE", actionable: !check.complete && blockedBy.length === 0 };
    });
    const completeCount = orchestratedChecks.filter(check => check.complete).length;
    const nextIncompleteKey = orchestratedChecks.find(check => check.actionable)?.key ?? orchestratedChecks.find(check => !check.complete)?.key ?? null;
    const blockedCount = orchestratedChecks.filter(check => check.status === "BLOCKED").length;
    const actionableCount = orchestratedChecks.filter(check => check.actionable).length;
    const allComplete = completeCount === orchestratedChecks.length;
    return { checks: orchestratedChecks, completeCount, totalCount: orchestratedChecks.length, percent: Math.round(completeCount / orchestratedChecks.length * 100), nextIncompleteKey, blockedCount, actionableCount, allComplete, workflowStatus: allComplete ? "COMPLETE" : "IN_PROGRESS", generatedAt: new Date().toISOString() };
  });
  return res.json({ data: snapshot });
}));

// P410: configuration transfer apply is server-transactional. All supported transfer
// scopes validate before mutation and use a single tenant-context transaction.
schoolConfigRouter.post("/:organizationId/:schoolId/configuration-transfer/import", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const transferScope = req.body?.scope;
  const data = req.body?.data;
  const permission = transferScope === "academic" || transferScope === "calendar" ? "academics.manage" : "school.settings.manage";
  if (!(await requirePermission(s, res, permission))) return;
  if (!["profile", "working", "policies", "academic", "calendar"].includes(transferScope)) return res.status(400).json({ error: "Unsupported configuration transfer scope" });
  if (transferScope === "academic" && !await hasAcademicConfigurationEntitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Academic configuration is not included in the active subscription" });
  const result = await withTenantContext(prisma, s, async tx => {
    const auditTransfer = (metadata: any) => tx.auditLog.create({ data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, action: "school.configuration.transfer.imported", resourceType: "SchoolConfigurationTransfer", outcome: "SUCCESS", metadata } });
    if (transferScope === "profile") {
      const parsed = schoolProfileSchema.safeParse(data);
      if (!parsed.success) throw Object.assign(new Error("Invalid school profile transfer"), { status: 400, details: parsed.error.flatten() });
      const saved = await tx.schoolProfile.upsert({ where: { schoolId: s.schoolId }, create: { ...parsed.data, organizationId: s.organizationId, schoolId: s.schoolId, displayName: parsed.data.displayName }, update: parsed.data });
      const metadata = { scope: transferScope, updated: 1, resourceId: saved.id }; await auditTransfer(metadata); return metadata;
    }
    if (transferScope === "working") {
      const parsed = dayConfigurationSchema.safeParse(data?.days);
      if (!parsed.success) throw Object.assign(new Error("Invalid working-days transfer"), { status: 400, details: parsed.error.flatten() });
      const prereq = await onboardingPrerequisites(tx, s);
      if (!prereq.profileComplete) throw Object.assign(new Error("Complete school profile before importing working days"), { status: 409 });
      const saved = await Promise.all(parsed.data.map(day => tx.schoolDayConfiguration.upsert({ where: { schoolId_dayOfWeek: { schoolId: s.schoolId, dayOfWeek: day.dayOfWeek } }, create: { ...day, organizationId: s.organizationId, schoolId: s.schoolId }, update: day })));
      const metadata = { scope: transferScope, updated: saved.length }; await auditTransfer(metadata); return metadata;
    }
    if (transferScope === "policies") {
      const parsed = schoolPolicySchema.safeParse(data);
      if (!parsed.success) throw Object.assign(new Error("Invalid policy transfer"), { status: 400, details: parsed.error.flatten() });
      const prereq = await onboardingPrerequisites(tx, s);
      if (!prereq.profileComplete || !prereq.currentYear) throw Object.assign(new Error("Complete school profile and activate an academic year before importing policies"), { status: 409 });
      const updates = Object.entries(parsed.data).filter(([, value]) => value !== undefined);
      const saved = await Promise.all(updates.map(([policyKey, value]) => tx.schoolPolicy.upsert({ where: { schoolId_policyKey: { schoolId: s.schoolId, policyKey } }, create: { organizationId: s.organizationId, schoolId: s.schoolId, policyKey, value: value as any, updatedBy: s.userId }, update: { value: value as any, updatedBy: s.userId } })));
      const metadata = { scope: transferScope, updated: saved.length }; await auditTransfer(metadata); return metadata;
    }
    if (transferScope === "academic") {
      if (!Array.isArray(data?.academicYears) || data.academicYears.length > 100) throw Object.assign(new Error("Academic transfer must contain an academicYears array with at most 100 entries"), { status: 400 });
      const parsedYears = data.academicYears.map((raw: any) => academicYearSchema.safeParse({ name: raw.name, code: raw.code, startsOn: raw.startsOn, endsOn: raw.endsOn, makeCurrent: raw.makeCurrent ?? false }));
      const errors = parsedYears.flatMap((parsed: any, index: number) => parsed.success ? [] : [`Academic year ${index + 1}: ${JSON.stringify(parsed.error.flatten())}`]);
      if (errors.length) throw Object.assign(new Error("Academic transfer validation failed"), { status: 400, details: errors });
      const currentCount = parsedYears.filter((parsed: any) => parsed.data.makeCurrent).length;
      if (currentCount > 1) throw Object.assign(new Error("Transfer can mark at most one academic year as current"), { status: 400 });
      const existing = await tx.academicYear.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId }, select: { code: true } });
      const codes = new Set(existing.map((year: any) => String(year.code).toLowerCase()));
      const incoming = new Set<string>();
      for (const parsed of parsedYears as any[]) { const code = String(parsed.data.code).toLowerCase(); if (codes.has(code) || incoming.has(code)) throw Object.assign(new Error(`Academic year code ${parsed.data.code} already exists`), { status: 409 }); incoming.add(code); }
      const created: string[] = [];
      let createdTerms = 0;
      for (const parsed of parsedYears as any[]) {
        const year = parsed.data;
        if (year.makeCurrent) await tx.academicYear.updateMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, isCurrent: true }, data: { isCurrent: false, status: "COMPLETED" } });
        const row = await tx.academicYear.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, name: year.name, code: year.code, startsOn: toDate(year.startsOn), endsOn: toDate(year.endsOn), isCurrent: year.makeCurrent, status: year.makeCurrent ? "ACTIVE" : "DRAFT", createdBy: s.userId } });
        created.push(row.id);
        if (!Array.isArray(year.terms) || year.terms.length > 100) throw Object.assign(new Error(`Terms for ${year.code} must be an array with at most 100 entries`), { status: 400 });
        const parsedTerms = year.terms.map((term: any) => academicTermSchema.safeParse(term));
        const termErrors = parsedTerms.flatMap((term: any, index: number) => term.success ? [] : [`${year.code} term ${index + 1}: ${JSON.stringify(term.error.flatten())}`]);
        if (termErrors.length) throw Object.assign(new Error("Academic term validation failed"), { status: 400, details: termErrors });
        const termCodes = new Set<string>(), sequences = new Set<number>();
        for (const term of parsedTerms as any[]) { const t = term.data; if (termCodes.has(t.code.toLowerCase()) || sequences.has(t.sequence)) throw Object.assign(new Error(`Duplicate term code or sequence in ${year.code}`), { status: 400 }); termCodes.add(t.code.toLowerCase()); sequences.add(t.sequence); if (t.startsOn < year.startsOn || t.endsOn > year.endsOn) throw Object.assign(new Error(`Term ${t.code} must fall within academic year ${year.code}`), { status: 400 }); }
        for (const term of parsedTerms as any[]) { await tx.academicTerm.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, academicYearId: row.id, name: term.data.name, code: term.data.code, termType: term.data.termType, sequence: term.data.sequence, startsOn: toDate(term.data.startsOn), endsOn: toDate(term.data.endsOn) } }); createdTerms++; }
      }
      const metadata = { scope: transferScope, createdYears: created.length, createdTerms }; await auditTransfer(metadata); return metadata;
    }
    if (transferScope === "calendar") {
      const parsedCalendar = calendarSchema.safeParse(data?.calendar);
      if (!parsedCalendar.success) throw Object.assign(new Error("Invalid calendar transfer"), { status: 400, details: parsedCalendar.error.flatten() });
      if (!Array.isArray(data?.events) || data.events.length > 500) throw Object.assign(new Error("Calendar transfer must contain an events array with at most 500 entries"), { status: 400 });
      const parsedEvents = data.events.map((event: any) => calendarEventSchema.safeParse(event));
      const errors = parsedEvents.flatMap((parsed: any, index: number) => parsed.success ? [] : [`Event ${index + 1}: ${JSON.stringify(parsed.error.flatten())}`]);
      if (errors.length) throw Object.assign(new Error("Calendar event validation failed"), { status: 400, details: errors });
      const prereq = await onboardingPrerequisites(tx, s);
      if (!prereq.profileComplete || !prereq.currentYear) throw Object.assign(new Error("Complete school profile and activate an academic year before importing calendars"), { status: 409 });
      let academicYearId = prereq.currentYear.id;
      if (parsedCalendar.data.academicYearId) {
        const validYear = await tx.academicYear.findFirst({ where: { id: parsedCalendar.data.academicYearId, organizationId: s.organizationId, schoolId: s.schoolId } });
        // Portable transfer IDs may belong to the source school; fall back to the target school's current year.
        if (validYear) academicYearId = validYear.id;
      }
      if (parsedCalendar.data.isDefault) await tx.schoolCalendar.updateMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId }, data: { isDefault: false } });
      const calendar = await tx.schoolCalendar.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, name: parsedCalendar.data.name, academicYearId: academicYearId || null, isDefault: parsedCalendar.data.isDefault || false } });
      for (const event of parsedEvents as any[]) await tx.calendarEvent.create({ data: { ...event.data, organizationId: s.organizationId, schoolId: s.schoolId, calendarId: calendar.id, startsAt: new Date(event.data.startsAt), endsAt: new Date(event.data.endsAt), createdBy: s.userId } });
      const metadata = { scope: transferScope, calendarId: calendar.id, createdEvents: parsedEvents.length }; await auditTransfer(metadata); return metadata;
    }
    throw Object.assign(new Error("Unsupported transfer scope"), { status: 400 });
  });
  return res.json({ data: result });
}));

schoolConfigRouter.get("/:organizationId/:schoolId/profile", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const profile = await withTenantContext(prisma, s, tx => tx.schoolProfile.findUnique({ where: { schoolId: s.schoolId } }));
  return res.json({ data: profile });
}));

schoolConfigRouter.put("/:organizationId/:schoolId/profile", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const parsed = schoolProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid school profile", details: parsed.error.flatten() });
  const result = await withTenantContext(prisma, s, tx => tx.schoolProfile.upsert({
    where: { schoolId: s.schoolId },
    create: { ...parsed.data, organizationId: s.organizationId, schoolId: s.schoolId, displayName: parsed.data.displayName },
    update: parsed.data
  }));
  await prisma.auditLog.create({
    data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId,
      action: "school.profile.updated", resourceType: "SchoolProfile", resourceId: result.id, outcome: "SUCCESS" }
  });
  return res.json({ data: result });
}));

schoolConfigRouter.get("/:organizationId/:schoolId/academic-years", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const years = await withTenantContext(prisma, s, tx => tx.academicYear.findMany({
    where: { organizationId: s.organizationId, schoolId: s.schoolId },
    orderBy: { startsOn: "desc" }
  }));
  return res.json({ data: years });
}));

schoolConfigRouter.post("/:organizationId/:schoolId/academic-years", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "academics.manage"))) return;
  if (!await hasAcademicConfigurationEntitlement(s.organizationId, s.schoolId)) {
    return res.status(402).json({ error: "Academic configuration is not included in the active subscription" });
  }
  const parsed = academicYearSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid academic year", details: parsed.error.flatten() });
  const result = await withTenantContext(prisma, s, async tx => {
    if (parsed.data.makeCurrent) {
      await tx.academicYear.updateMany({ where: { schoolId: s.schoolId, isCurrent: true }, data: { isCurrent: false, status: "COMPLETED" } });
    }
    return tx.academicYear.create({
      data: {
        organizationId: s.organizationId, schoolId: s.schoolId,
        name: parsed.data.name, code: parsed.data.code,
        startsOn: toDate(parsed.data.startsOn), endsOn: toDate(parsed.data.endsOn),
        isCurrent: parsed.data.makeCurrent, status: parsed.data.makeCurrent ? "ACTIVE" : "DRAFT",
        createdBy: s.userId
      }
    });
  });
  return res.status(201).json({ data: result });
}));

schoolConfigRouter.get("/:organizationId/:schoolId/academic-years/:academicYearId/terms", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const year = await withTenantContext(prisma, s, tx => tx.academicYear.findFirst({
    where: { id: req.params.academicYearId, organizationId: s.organizationId, schoolId: s.schoolId }
  }));
  if (!year) return res.status(404).json({ error: "Academic year not found" });
  const terms = await withTenantContext(prisma, s, tx => tx.academicTerm.findMany({
    where: { academicYearId: year.id, organizationId: s.organizationId, schoolId: s.schoolId },
    orderBy: { sequence: "asc" }
  }));
  return res.json({ data: terms });
}));

schoolConfigRouter.post("/:organizationId/:schoolId/academic-years/:academicYearId/terms", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "academics.manage"))) return;
  const parsed = academicTermSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid academic term", details: parsed.error.flatten() });
  const result = await withTenantContext(prisma, s, async tx => {
    const year = await tx.academicYear.findFirst({ where: { id: req.params.academicYearId, schoolId: s.schoolId, organizationId: s.organizationId } });
    if (!year) return null;
    if (!year.isCurrent || year.status !== "ACTIVE") throw Object.assign(new Error("Academic terms can only be configured for the active current academic year"), { status: 409 });
    if (toDate(parsed.data.startsOn) < year.startsOn || toDate(parsed.data.endsOn) > year.endsOn) {
      throw Object.assign(new Error("Academic term must fall within its academic year"), { status: 400 });
    }
    return tx.academicTerm.create({
      data: {
        organizationId: s.organizationId, schoolId: s.schoolId, academicYearId: year.id,
        name: parsed.data.name, code: parsed.data.code, termType: parsed.data.termType,
        sequence: parsed.data.sequence, startsOn: toDate(parsed.data.startsOn), endsOn: toDate(parsed.data.endsOn)
      }
    });
  });
  if (!result) return res.status(404).json({ error: "Academic year not found" });
  return res.status(201).json({ data: result });
}));

schoolConfigRouter.get("/:organizationId/:schoolId/calendars", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const calendars = await withTenantContext(prisma, s, tx => tx.schoolCalendar.findMany({
    where: { organizationId: s.organizationId, schoolId: s.schoolId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }]
  }));
  return res.json({ data: calendars });
}));

schoolConfigRouter.post("/:organizationId/:schoolId/calendars", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "academics.manage"))) return;
  const parsed = calendarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid calendar details" });
  const result = await withTenantContext(prisma, s, async tx => {
    const prerequisites = await onboardingPrerequisites(tx, s);
    if (!prerequisites.profileComplete || !prerequisites.currentYear) throw Object.assign(new Error("Complete the school profile and activate the current academic year before configuring calendars"), { status: 409 });
    if (parsed.data.academicYearId) {
      const year = await tx.academicYear.findFirst({ where: { id: parsed.data.academicYearId, schoolId: s.schoolId, organizationId: s.organizationId, isCurrent: true, status: "ACTIVE" } });
      if (!year) return null;
    }
    if (parsed.data.isDefault) await tx.schoolCalendar.updateMany({ where: { schoolId: s.schoolId, isDefault: true }, data: { isDefault: false } });
    return tx.schoolCalendar.create({
      data: { organizationId: s.organizationId, schoolId: s.schoolId, ...parsed.data }
    });
  });
  if (!result) return res.status(404).json({ error: "Academic year not found" });
  return res.status(201).json({ data: result });
}));

schoolConfigRouter.get("/:organizationId/:schoolId/calendars/:calendarId/events", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const events = await withTenantContext(prisma, s, async tx => {
    const calendar = await tx.schoolCalendar.findFirst({ where: { id: req.params.calendarId, schoolId: s.schoolId, organizationId: s.organizationId } });
    if (!calendar) return null;
    return tx.calendarEvent.findMany({
      where: { calendarId: calendar.id, organizationId: s.organizationId, schoolId: s.schoolId },
      orderBy: { startsAt: "asc" }
    });
  });
  if (!events) return res.status(404).json({ error: "Calendar not found" });
  return res.json({ data: events });
}));

schoolConfigRouter.post("/:organizationId/:schoolId/calendars/:calendarId/events", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "academics.manage"))) return;
  const parsed = calendarEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid calendar event", details: parsed.error.flatten() });
  const result = await withTenantContext(prisma, s, async tx => {
    const calendar = await tx.schoolCalendar.findFirst({ where: { id: req.params.calendarId, schoolId: s.schoolId, organizationId: s.organizationId } });
    if (!calendar) return null;
    return tx.calendarEvent.create({
      data: {
        ...parsed.data, organizationId: s.organizationId, schoolId: s.schoolId,
        calendarId: calendar.id, startsAt: new Date(parsed.data.startsAt), endsAt: new Date(parsed.data.endsAt),
        createdBy: s.userId
      }
    });
  });
  if (!result) return res.status(404).json({ error: "Calendar not found" });
  return res.status(201).json({ data: result });
}));

schoolConfigRouter.get("/:organizationId/:schoolId/working-days", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const days = await withTenantContext(prisma, s, tx => tx.schoolDayConfiguration.findMany({
    where: { organizationId: s.organizationId, schoolId: s.schoolId }, orderBy: { dayOfWeek: "asc" }
  }));
  return res.json({ data: days });
}));

schoolConfigRouter.put("/:organizationId/:schoolId/working-days", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const parsed = dayConfigurationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid working day configuration", details: parsed.error.flatten() });
  const days = await withTenantContext(prisma, s, async tx => {
    const prerequisites = await onboardingPrerequisites(tx, s);
    if (!prerequisites.profileComplete) throw Object.assign(new Error("Complete the school profile before configuring working days"), { status: 409 });
    return Promise.all(parsed.data.map(day =>
    tx.schoolDayConfiguration.upsert({
      where: { schoolId_dayOfWeek: { schoolId: s.schoolId, dayOfWeek: day.dayOfWeek } },
      create: { ...day, organizationId: s.organizationId, schoolId: s.schoolId },
      update: day
    })
  ));
  });
  return res.json({ data: days });
}));

schoolConfigRouter.get("/:organizationId/:schoolId/policies", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const policies = await withTenantContext(prisma, s, tx => tx.schoolPolicy.findMany({
    where: { organizationId: s.organizationId, schoolId: s.schoolId }
  }));
  return res.json({ data: policies });
}));

schoolConfigRouter.put("/:organizationId/:schoolId/policies", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;
  const parsed = schoolPolicySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid school policy", details: parsed.error.flatten() });
  const updates = Object.entries(parsed.data).map(([policyKey, value]) => ({ policyKey, value }));
  const results = await withTenantContext(prisma, s, async tx => {
    const prerequisites = await onboardingPrerequisites(tx, s);
    if (!prerequisites.profileComplete || !prerequisites.currentYear) throw Object.assign(new Error("Complete the school profile and activate the current academic year before configuring policies"), { status: 409 });
    return Promise.all(updates.map(item =>
    tx.schoolPolicy.upsert({
      where: { schoolId_policyKey: { schoolId: s.schoolId, policyKey: item.policyKey } },
      create: { organizationId: s.organizationId, schoolId: s.schoolId, ...item, updatedBy: s.userId },
      update: { value: item.value, version: { increment: 1 }, updatedBy: s.userId }
    })
  ));
  });
  return res.json({ data: results });
}));
