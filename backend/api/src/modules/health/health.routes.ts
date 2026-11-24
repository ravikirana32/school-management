import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasSchoolAdminAccess } from "../organizations/organization.authorization.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";

export const healthRouter = Router();
healthRouter.use(authenticate);
const wrap = (fn: (req: any, res: any) => Promise<any>) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);
const profileSchema = z.object({ bloodGroup: z.string().max(12).nullable().optional(), allergies: z.string().max(4000).nullable().optional(), medicalConditions: z.string().max(4000).nullable().optional(), medicationNotes: z.string().max(4000).nullable().optional(), emergencyMedicalNotes: z.string().max(4000).nullable().optional() });
const eventSchema = z.object({ eventType: z.enum(["HEALTH_VISIT", "MEDICATION", "INJURY", "INCIDENT", "OTHER"]), occurredAt: z.string().datetime().optional(), summary: z.string().trim().min(1).max(500), details: z.string().max(10000).optional(), treatment: z.string().max(10000).optional(), medication: z.string().max(4000).optional() });
async function scope(req: any, res: any) {
  const organizationId = String(req.params.organizationId || ""), schoolId = String(req.params.schoolId || ""), userId = req.auth!.userId;
  if (!await hasActiveSchoolMembership(userId, organizationId, schoolId)) { res.status(403).json({ error: "Active school membership required" }); return null; }
  return { organizationId, schoolId, userId };
}
async function isAdmin(user: string, org: string, school: string) { return hasSchoolAdminAccess(user, org, school); }
async function permitted(user: string, org: string, school: string, permission: string) { return isAdmin(user, org, school) || hasSchoolPermission(user, org, school, permission); }
async function sensitiveRead(user: string, org: string, school: string) { return isAdmin(user, org, school) || hasSchoolPermission(user, org, school, "health.read.sensitive") || hasSchoolPermission(user, org, school, "health.manage"); }
async function audit(s: any, action: string, resourceType: string, resourceId: string | undefined, outcome: "SUCCESS" | "DENIED", metadata?: Record<string, unknown>) {
  // Never include health values, clinical notes, medication names, or profile payloads in audit metadata.
  await withTenantContext(prisma, s, tx => tx.auditLog.create({ data: { actorUserId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, action, resourceType, resourceId, outcome, metadata } }));
}
function maskProfile(profile: any, allowSensitive: boolean) {
  if (!profile || allowSensitive) return profile;
  return { id: profile.id, studentId: profile.studentId, organizationId: profile.organizationId, schoolId: profile.schoolId, updatedBy: profile.updatedBy, createdAt: profile.createdAt, updatedAt: profile.updatedAt, restricted: true };
}
function maskEvents(events: any[], allowSensitive: boolean) {
  if (allowSensitive) return events;
  return events.map(({ id, studentId, eventType, occurredAt, summary, recordedBy, createdAt }: any) => ({ id, studentId, eventType, occurredAt, summary, recordedBy, createdAt, restricted: true }));
}
healthRouter.get("/:organizationId/:schoolId/health/students/:studentId/profile", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.read")) { await audit(s, "health.profile.read", "StudentHealthProfile", req.params.studentId, "DENIED"); return res.status(403).json({ error: "Health read permission required" }); }
  const allowSensitive = await sensitiveRead(s.userId, s.organizationId, s.schoolId);
  const data = await withTenantContext(prisma, s, tx => tx.studentHealthProfile.findFirst({ where: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: req.params.studentId } }));
  await audit(s, "health.profile.read", "StudentHealthProfile", req.params.studentId, "SUCCESS", { sensitiveFieldsIncluded: allowSensitive, recordFound: Boolean(data) });
  return res.json({ data: maskProfile(data, allowSensitive) });
}));
healthRouter.put("/:organizationId/:schoolId/health/students/:studentId/profile", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.manage")) { await audit(s, "health.profile.write", "StudentHealthProfile", req.params.studentId, "DENIED"); return res.status(403).json({ error: "Health manage permission required" }); }
  const p = profileSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: "Invalid health profile", details: p.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } });
    if (!student) throw Object.assign(new Error("Student not found"), { status: 404 });
    return tx.studentHealthProfile.upsert({ where: { studentId: student.id }, create: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, updatedBy: s.userId, ...p.data }, update: { ...p.data, updatedBy: s.userId } });
  });
  await audit(s, "health.profile.write", "StudentHealthProfile", req.params.studentId, "SUCCESS", { fieldsChanged: Object.keys(p.data) });
  return res.json({ data });
}));
healthRouter.get("/:organizationId/:schoolId/health/students/:studentId/events", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.read")) { await audit(s, "health.events.read", "StudentHealthEvent", req.params.studentId, "DENIED"); return res.status(403).json({ error: "Health read permission required" }); }
  const allowSensitive = await sensitiveRead(s.userId, s.organizationId, s.schoolId);
  const data = await withTenantContext(prisma, s, tx => tx.studentHealthEvent.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: req.params.studentId }, orderBy: { occurredAt: "desc" }, take: 100 }));
  await audit(s, "health.events.read", "StudentHealthEvent", req.params.studentId, "SUCCESS", { count: data.length, sensitiveFieldsIncluded: allowSensitive });
  return res.json({ data: maskEvents(data, allowSensitive) });
}));
healthRouter.post("/:organizationId/:schoolId/health/students/:studentId/events", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.manage")) { await audit(s, "health.events.write", "StudentHealthEvent", req.params.studentId, "DENIED"); return res.status(403).json({ error: "Health manage permission required" }); }
  const p = eventSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: "Invalid health event", details: p.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } });
    if (!student) throw Object.assign(new Error("Student not found"), { status: 404 });
    return tx.studentHealthEvent.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, recordedBy: s.userId, ...p.data, occurredAt: p.data.occurredAt ? new Date(p.data.occurredAt) : undefined } });
  });
  await audit(s, "health.events.write", "StudentHealthEvent", data.id, "SUCCESS", { eventType: p.data.eventType });
  return res.status(201).json({ data });
}));
healthRouter.get("/:organizationId/:schoolId/health/events", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.read")) { await audit(s, "health.events.list", "StudentHealthEvent", undefined, "DENIED"); return res.status(403).json({ error: "Health read permission required" }); }
  const allowSensitive = await sensitiveRead(s.userId, s.organizationId, s.schoolId);
  const data = await withTenantContext(prisma, s, tx => tx.studentHealthEvent.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId }, orderBy: { occurredAt: "desc" }, take: 100 }));
  await audit(s, "health.events.list", "StudentHealthEvent", undefined, "SUCCESS", { count: data.length, sensitiveFieldsIncluded: allowSensitive });
  return res.json({ data: maskEvents(data, allowSensitive) });
}));

// P541 structured safety profile collections: allergy, condition and medication.
const safetySchemas: Record<string, any> = {
  allergies: z.object({ substance: z.string().trim().min(1).max(160), reaction: z.string().max(4000).nullable().optional(), severity: z.enum(["UNKNOWN", "LOW", "MODERATE", "HIGH", "CRITICAL"]).optional(), notes: z.string().max(4000).nullable().optional(), active: z.boolean().optional() }),
  conditions: z.object({ condition: z.string().trim().min(1).max(160), severity: z.enum(["UNKNOWN", "LOW", "MODERATE", "HIGH", "CRITICAL"]).optional(), diagnosedAt: z.string().datetime().nullable().optional(), notes: z.string().max(4000).nullable().optional(), active: z.boolean().optional() }),
  medications: z.object({ name: z.string().trim().min(1).max(160), dosage: z.string().max(160).nullable().optional(), frequency: z.string().max(160).nullable().optional(), instructions: z.string().max(4000).nullable().optional(), startDate: z.string().datetime().nullable().optional(), endDate: z.string().datetime().nullable().optional(), active: z.boolean().optional() })
};
const safetyModels: Record<string, any> = { allergies: "studentHealthAllergy", conditions: "studentHealthCondition", medications: "studentHealthMedication" };
const safetyPermissions = async (s: any, res: any, action: "read" | "manage") => {
  const perm = action === "read" ? "health.read" : "health.manage";
  if (!await permitted(s.userId, s.organizationId, s.schoolId, perm)) { await audit(s, `health.safety.${action}`, "StudentHealthSafety", undefined, "DENIED", { collection: "safety" }); res.status(403).json({ error: `Health ${action} permission required` }); return false; }
  return true;
};
for (const collection of ["allergies", "conditions", "medications"] as const) {
  healthRouter.get(`/:organizationId/:schoolId/health/students/:studentId/${collection}`, wrap(async (req, res) => {
    const s = await scope(req, res); if (!s) return;
    if (!await safetyPermissions(s, res, "read")) return;
    const sensitive = await sensitiveRead(s.userId, s.organizationId, s.schoolId);
    const rows = await withTenantContext(prisma, s, async tx => {
      const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } });
      if (!student) return null;
      return (tx as any)[safetyModels[collection]].findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id }, orderBy: { createdAt: "desc" }, take: 100 });
    });
    if (rows === null) return res.status(404).json({ error: "Student not found" });
    await audit(s, `health.safety.${collection}.read`, "StudentHealthSafety", req.params.studentId, "SUCCESS", { count: rows.length, sensitiveFieldsIncluded: sensitive });
    return res.json({ data: sensitive ? rows : rows.map((row: any) => ({ id: row.id, studentId: row.studentId, active: row.active, createdAt: row.createdAt, restricted: true })) });
  }));
  healthRouter.post(`/:organizationId/:schoolId/health/students/:studentId/${collection}`, wrap(async (req, res) => {
    const s = await scope(req, res); if (!s) return;
    if (!await safetyPermissions(s, res, "manage")) return;
    const parsed = safetySchemas[collection].safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Invalid health safety record", details: parsed.error.flatten() });
    const created = await withTenantContext(prisma, s, async tx => {
      const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } });
      if (!student) return null;
      const normalized = { ...parsed.data };
      for (const key of ["diagnosedAt", "startDate", "endDate"]) if (normalized[key]) normalized[key] = new Date(normalized[key]);
      return (tx as any)[safetyModels[collection]].create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, recordedBy: s.userId, ...normalized } });
    });
    if (!created) return res.status(404).json({ error: "Student not found" });
    await audit(s, `health.safety.${collection}.create`, "StudentHealthSafety", created.id, "SUCCESS", { fieldsChanged: Object.keys(parsed.data) });
    return res.status(201).json({ data: created });
  }));
  healthRouter.patch(`/:organizationId/:schoolId/health/students/:studentId/${collection}/:recordId`, wrap(async (req, res) => {
    const s = await scope(req, res); if (!s) return;
    if (!await safetyPermissions(s, res, "manage")) return;
    const parsed = safetySchemas[collection].partial().safeParse(req.body); if (!parsed.success || !Object.keys(parsed.data || {}).length) return res.status(400).json({ error: "Invalid health safety update", details: parsed.success ? undefined : parsed.error.flatten() });
    const normalized: any = { ...parsed.data };
    for (const key of ["diagnosedAt", "startDate", "endDate"]) if (normalized[key]) normalized[key] = new Date(normalized[key]);
    const updated = await withTenantContext(prisma, s, async tx => (tx as any)[safetyModels[collection]].updateMany({ where: { id: req.params.recordId, organizationId: s.organizationId, schoolId: s.schoolId, studentId: req.params.studentId }, data: normalized }));
    if (!updated.count) return res.status(404).json({ error: "Health safety record not found" });
    await audit(s, `health.safety.${collection}.update`, "StudentHealthSafety", req.params.recordId, "SUCCESS", { fieldsChanged: Object.keys(parsed.data) });
    return res.json({ updated: updated.count });
  }));
}


// P542 authorized staff case workflow, triage, assignment and follow-up.
const healthCaseCreateSchema = z.object({
  caseType: z.enum(["GENERAL", "INJURY", "ILLNESS", "MEDICATION", "WELLBEING", "OTHER"]),
  title: z.string().trim().min(1).max(180), description: z.string().max(10000).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(), assignedToUserId: z.string().min(1).optional(), nextFollowUpAt: z.string().datetime().nullable().optional()
});
const healthCaseUpdateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  assignedToUserId: z.string().min(1).nullable().optional(),
  nextFollowUpAt: z.string().datetime().nullable().optional(),
  title: z.string().trim().min(1).max(180).optional(), description: z.string().max(10000).nullable().optional()
}).refine(v => Object.keys(v).length > 0, "At least one field is required");
const healthFollowUpSchema = z.object({ note: z.string().trim().min(1).max(10000), outcome: z.string().max(1200).optional(), nextFollowUpAt: z.string().datetime().nullable().optional() });
healthRouter.get("/:organizationId/:schoolId/health/cases", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.read")) { await audit(s, "health.case.list", "StudentHealthCase", undefined, "DENIED"); return res.status(403).json({ error: "Health read permission required" }); }
  const studentId = typeof req.query.studentId === "string" ? req.query.studentId : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const priority = typeof req.query.priority === "string" ? req.query.priority : undefined;
  const rows = await withTenantContext(prisma, s, tx => tx.studentHealthCase.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, ...(studentId ? { studentId } : {}), ...(status ? { status } : {}), ...(priority ? { priority } : {}) }, orderBy: [{ priority: "desc" }, { updatedAt: "desc" }], take: 100, include: { followUps: { orderBy: { createdAt: "desc" }, take: 10 } } }));
  const sensitive = await sensitiveRead(s.userId, s.organizationId, s.schoolId);
  await audit(s, "health.case.list", "StudentHealthCase", undefined, "SUCCESS", { count: rows.length, sensitiveFieldsIncluded: sensitive });
  return res.json({ data: sensitive ? rows : rows.map(({ description, followUps, ...safe }: any) => ({ ...safe, followUps: followUps.map(({ note, ...f }: any) => ({ ...f, restricted: true })), restricted: true })) });
}));
healthRouter.post("/:organizationId/:schoolId/health/students/:studentId/cases", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.manage")) { await audit(s, "health.case.create", "StudentHealthCase", req.params.studentId, "DENIED"); return res.status(403).json({ error: "Health manage permission required" }); }
  const p = healthCaseCreateSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: "Invalid health case", details: p.error.flatten() });
  if (p.data.assignedToUserId && (!await hasActiveSchoolMembership(p.data.assignedToUserId, s.organizationId, s.schoolId) || !await permitted(p.data.assignedToUserId, s.organizationId, s.schoolId, "health.manage"))) return res.status(400).json({ error: "Assignee must be an active health-authorized staff member in this school" });
  const row = await withTenantContext(prisma, s, async tx => { const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } }); if (!student) return null; return tx.studentHealthCase.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, openedByUserId: s.userId, caseType: p.data.caseType, title: p.data.title, description: p.data.description, priority: p.data.priority || "NORMAL", assignedToUserId: p.data.assignedToUserId, nextFollowUpAt: p.data.nextFollowUpAt ? new Date(p.data.nextFollowUpAt) : null } }); });
  if (!row) return res.status(404).json({ error: "Student not found" }); await audit(s, "health.case.create", "StudentHealthCase", row.id, "SUCCESS", { caseType: row.caseType, priority: row.priority }); return res.status(201).json({ data: (await sensitiveRead(s.userId, s.organizationId, s.schoolId)) ? row : { id: row.id, studentId: row.studentId, caseType: row.caseType, title: row.title, priority: row.priority, status: row.status, assignedToUserId: row.assignedToUserId, openedAt: row.openedAt, nextFollowUpAt: row.nextFollowUpAt, restricted: true } });
}));
healthRouter.patch("/:organizationId/:schoolId/health/cases/:caseId", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.manage")) { await audit(s, "health.case.update", "StudentHealthCase", req.params.caseId, "DENIED"); return res.status(403).json({ error: "Health manage permission required" }); }
  const p = healthCaseUpdateSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: "Invalid health case update", details: p.error.flatten() });
  if (p.data.assignedToUserId && (!await hasActiveSchoolMembership(p.data.assignedToUserId, s.organizationId, s.schoolId) || !await permitted(p.data.assignedToUserId, s.organizationId, s.schoolId, "health.manage"))) return res.status(400).json({ error: "Assignee must be an active health-authorized staff member in this school" });
  const existing = await withTenantContext(prisma, s, tx => tx.studentHealthCase.findFirst({ where: { id: req.params.caseId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { status: true } })); if (!existing) return res.status(404).json({ error: "Health case not found" });
  const transitions: Record<string, string[]> = { OPEN: ["IN_PROGRESS", "WAITING", "CLOSED"], IN_PROGRESS: ["WAITING", "CLOSED", "OPEN"], WAITING: ["IN_PROGRESS", "CLOSED", "OPEN"], CLOSED: ["OPEN"] };
  if (p.data.status && p.data.status !== existing.status && !transitions[existing.status]?.includes(p.data.status)) return res.status(409).json({ error: "Invalid health case status transition", currentStatus: existing.status, requestedStatus: p.data.status });
  const data: any = { ...p.data }; if (data.nextFollowUpAt) data.nextFollowUpAt = new Date(data.nextFollowUpAt); if (data.status === "CLOSED") data.closedAt = new Date(); else if (data.status === "OPEN") data.closedAt = null;
  const changed = await withTenantContext(prisma, s, tx => tx.studentHealthCase.updateMany({ where: { id: req.params.caseId, organizationId: s.organizationId, schoolId: s.schoolId, status: existing.status }, data })); if (!changed.count) return res.status(409).json({ error: "Health case changed concurrently; refresh and retry" });
  await audit(s, "health.case.update", "StudentHealthCase", req.params.caseId, "SUCCESS", { fieldsChanged: Object.keys(p.data), status: p.data.status }); const row = await withTenantContext(prisma, s, tx => tx.studentHealthCase.findFirst({ where: { id: req.params.caseId, organizationId: s.organizationId, schoolId: s.schoolId } })); return res.json({ data: (await sensitiveRead(s.userId, s.organizationId, s.schoolId)) ? row : { id: row?.id, studentId: row?.studentId, title: row?.title, caseType: row?.caseType, status: row?.status, priority: row?.priority, assignedToUserId: row?.assignedToUserId, nextFollowUpAt: row?.nextFollowUpAt, restricted: true } });
}));
healthRouter.post("/:organizationId/:schoolId/health/cases/:caseId/follow-ups", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.manage")) { await audit(s, "health.case.followup", "StudentHealthCaseFollowUp", req.params.caseId, "DENIED"); return res.status(403).json({ error: "Health manage permission required" }); }
  const p = healthFollowUpSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: "Invalid follow-up", details: p.error.flatten() });
  const result = await withTenantContext(prisma, s, async tx => { const c = await tx.studentHealthCase.findFirst({ where: { id: req.params.caseId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true, studentId: true, status: true } }); if (!c || c.status === "CLOSED") return null; const follow = await tx.studentHealthCaseFollowUp.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, caseId: c.id, studentId: c.studentId, recordedByUserId: s.userId, note: p.data.note, outcome: p.data.outcome, nextFollowUpAt: p.data.nextFollowUpAt ? new Date(p.data.nextFollowUpAt) : null } }); await tx.studentHealthCase.update({ where: { id: c.id }, data: { nextFollowUpAt: p.data.nextFollowUpAt ? new Date(p.data.nextFollowUpAt) : null, status: c.status === "OPEN" ? "IN_PROGRESS" : c.status } }); return follow; });
  if (!result) return res.status(404).json({ error: "Open health case not found" }); await audit(s, "health.case.followup", "StudentHealthCaseFollowUp", result.id, "SUCCESS", { caseId: req.params.caseId, hasOutcome: Boolean(p.data.outcome), nextFollowUpScheduled: Boolean(p.data.nextFollowUpAt) }); return res.status(201).json({ data: (await sensitiveRead(s.userId, s.organizationId, s.schoolId)) ? result : { id: result.id, caseId: result.caseId, studentId: result.studentId, createdAt: result.createdAt, restricted: true } });
}));

// P543 — Health incident workflow. Guardian notifications are queued only for
// guardians with communication eligibility AND active explicit health consent.
const healthIncidentCreateSchema = z.object({
  incidentType: z.enum(["INJURY", "ILLNESS", "ALLERGY_REACTION", "MEDICATION", "WELLBEING", "OTHER"]),
  severity: z.enum(["LOW", "NORMAL", "HIGH", "URGENT", "CRITICAL"]).default("NORMAL"),
  title: z.string().trim().min(1).max(180), description: z.string().max(10000).optional(),
  caseId: z.string().optional(), assignedToUserId: z.string().optional(), notifyGuardians: z.boolean().default(true)
});
const healthIncidentUpdateSchema = z.object({
  status: z.enum(["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"]).optional(),
  severity: z.enum(["LOW", "NORMAL", "HIGH", "URGENT", "CRITICAL"]).optional(),
  assignedToUserId: z.string().nullable().optional(),
  title: z.string().trim().min(1).max(180).optional(), description: z.string().max(10000).nullable().optional()
}).refine(v => Object.keys(v).length > 0, "At least one field is required");
healthRouter.get("/:organizationId/:schoolId/health/incidents", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.read")) { await audit(s, "health.incident.list", "StudentHealthIncident", undefined, "DENIED"); return res.status(403).json({ error: "Health read permission required" }); }
  const studentId = typeof req.query.studentId === "string" ? req.query.studentId : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const severity = typeof req.query.severity === "string" ? req.query.severity : undefined;
  const rows = await withTenantContext(prisma, s, tx => tx.studentHealthIncident.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, ...(studentId ? { studentId } : {}), ...(status ? { status } : {}), ...(severity ? { severity } : {}) }, orderBy: [{ severity: "desc" }, { createdAt: "desc" }], take: 100 }));
  const sensitive = await sensitiveRead(s.userId, s.organizationId, s.schoolId);
  await audit(s, "health.incident.list", "StudentHealthIncident", undefined, "SUCCESS", { count: rows.length, sensitiveFieldsIncluded: sensitive });
  return res.json({ data: sensitive ? rows : rows.map(({ description, ...safe }: any) => ({ ...safe, restricted: true })) });
}));
healthRouter.post("/:organizationId/:schoolId/health/students/:studentId/incidents", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.manage")) { await audit(s, "health.incident.create", "StudentHealthIncident", req.params.studentId, "DENIED"); return res.status(403).json({ error: "Health manage permission required" }); }
  const p = healthIncidentCreateSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: "Invalid health incident", details: p.error.flatten() });
  if (p.data.assignedToUserId && (!await hasActiveSchoolMembership(p.data.assignedToUserId, s.organizationId, s.schoolId) || !await permitted(p.data.assignedToUserId, s.organizationId, s.schoolId, "health.manage"))) return res.status(400).json({ error: "Assignee must be an active health-authorized staff member in this school" });
  const created = await withTenantContext(prisma, s, async tx => {
    const student = await tx.student.findFirst({ where: { id: req.params.studentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } }); if (!student) return null;
    if (p.data.caseId && !await tx.studentHealthCase.findFirst({ where: { id: p.data.caseId, organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id }, select: { id: true } })) return { invalidCase: true } as any;
    const incident = await tx.studentHealthIncident.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, caseId: p.data.caseId, incidentType: p.data.incidentType, severity: p.data.severity, title: p.data.title, description: p.data.description, assignedToUserId: p.data.assignedToUserId, reportedByUserId: s.userId } });
    let queued = 0;
    if (p.data.notifyGuardians) {
      const guardianLinks = await tx.studentGuardian.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, canReceiveCommunications: true }, select: { guardianId: true } });
      for (const link of guardianLinks) {
        const consent = await tx.studentHealthConsent.findFirst({ where: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: student.id, guardianId: link.guardianId, grantedAt: { not: null }, revokedAt: null }, select: { id: true } });
        if (consent) { await tx.studentHealthIncidentNotification.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, incidentId: incident.id, guardianId: link.guardianId, eventType: "HEALTH_INCIDENT" } }); queued++; }
      }
    }
    return { incident, queued };
  });
  if (!created) return res.status(404).json({ error: "Student not found" }); if (created.invalidCase) return res.status(400).json({ error: "Case must belong to this student and school" });
  await audit(s, "health.incident.create", "StudentHealthIncident", created.incident.id, "SUCCESS", { incidentType: created.incident.incidentType, severity: created.incident.severity, guardianNotificationsQueued: created.queued });
  const sensitive = await sensitiveRead(s.userId, s.organizationId, s.schoolId);
  return res.status(201).json({ data: sensitive ? created.incident : { id: created.incident.id, studentId: created.incident.studentId, caseId: created.incident.caseId, incidentType: created.incident.incidentType, severity: created.incident.severity, title: created.incident.title, status: created.incident.status, escalationLevel: created.incident.escalationLevel, createdAt: created.incident.createdAt, restricted: true }, guardianNotificationsQueued: created.queued });
}));
healthRouter.patch("/:organizationId/:schoolId/health/incidents/:incidentId", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.manage")) { await audit(s, "health.incident.update", "StudentHealthIncident", req.params.incidentId, "DENIED"); return res.status(403).json({ error: "Health manage permission required" }); }
  const p = healthIncidentUpdateSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: "Invalid incident update", details: p.error.flatten() });
  if (p.data.assignedToUserId && (!await hasActiveSchoolMembership(p.data.assignedToUserId, s.organizationId, s.schoolId) || !await permitted(p.data.assignedToUserId, s.organizationId, s.schoolId, "health.manage"))) return res.status(400).json({ error: "Assignee must be an active health-authorized staff member in this school" });
  const old = await withTenantContext(prisma, s, tx => tx.studentHealthIncident.findFirst({ where: { id: req.params.incidentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { status: true } })); if (!old) return res.status(404).json({ error: "Health incident not found" });
  const allowed: Record<string, string[]> = { OPEN: ["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"], ACKNOWLEDGED: ["IN_PROGRESS", "RESOLVED", "OPEN"], IN_PROGRESS: ["ACKNOWLEDGED", "RESOLVED", "OPEN"], RESOLVED: ["OPEN"] };
  if (p.data.status && p.data.status !== old.status && !allowed[old.status]?.includes(p.data.status)) return res.status(409).json({ error: "Invalid health incident status transition", currentStatus: old.status, requestedStatus: p.data.status });
  const data: any = { ...p.data }; if (data.status === "RESOLVED") data.resolvedAt = new Date(); else if (data.status === "OPEN") data.resolvedAt = null;
  const changed = await withTenantContext(prisma, s, tx => tx.studentHealthIncident.updateMany({ where: { id: req.params.incidentId, organizationId: s.organizationId, schoolId: s.schoolId, status: old.status }, data })); if (!changed.count) return res.status(409).json({ error: "Incident changed concurrently; refresh and retry" });
  await audit(s, "health.incident.update", "StudentHealthIncident", req.params.incidentId, "SUCCESS", { fieldsChanged: Object.keys(p.data), status: p.data.status });
  const row = await withTenantContext(prisma, s, tx => tx.studentHealthIncident.findFirst({ where: { id: req.params.incidentId, organizationId: s.organizationId, schoolId: s.schoolId } })); const sensitive = await sensitiveRead(s.userId, s.organizationId, s.schoolId);
  return res.json({ data: sensitive ? row : { id: row?.id, studentId: row?.studentId, caseId: row?.caseId, incidentType: row?.incidentType, severity: row?.severity, title: row?.title, status: row?.status, escalationLevel: row?.escalationLevel, assignedToUserId: row?.assignedToUserId, restricted: true } });
}));
healthRouter.post("/:organizationId/:schoolId/health/incidents/:incidentId/acknowledge", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.manage")) { await audit(s, "health.incident.acknowledge", "StudentHealthIncident", req.params.incidentId, "DENIED"); return res.status(403).json({ error: "Health manage permission required" }); }
  const result = await withTenantContext(prisma, s, tx => tx.studentHealthIncident.updateMany({ where: { id: req.params.incidentId, organizationId: s.organizationId, schoolId: s.schoolId, status: "OPEN" }, data: { status: "ACKNOWLEDGED", acknowledgedByUserId: s.userId, acknowledgedAt: new Date() } })); if (!result.count) return res.status(409).json({ error: "Incident not found or no longer open" });
  await audit(s, "health.incident.acknowledge", "StudentHealthIncident", req.params.incidentId, "SUCCESS"); return res.json({ acknowledged: true });
}));
healthRouter.post("/:organizationId/:schoolId/health/incidents/:incidentId/escalate", wrap(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  if (!await permitted(s.userId, s.organizationId, s.schoolId, "health.manage")) { await audit(s, "health.incident.escalate", "StudentHealthIncident", req.params.incidentId, "DENIED"); return res.status(403).json({ error: "Health manage permission required" }); }
  const result = await withTenantContext(prisma, s, tx => tx.studentHealthIncident.updateMany({ where: { id: req.params.incidentId, organizationId: s.organizationId, schoolId: s.schoolId, status: { not: "RESOLVED" } }, data: { escalationLevel: { increment: 1 }, escalatedAt: new Date(), status: "IN_PROGRESS" } })); if (!result.count) return res.status(404).json({ error: "Active health incident not found" });
  await audit(s, "health.incident.escalate", "StudentHealthIncident", req.params.incidentId, "SUCCESS", { escalationIncremented: true });
  const row = await withTenantContext(prisma, s, tx => tx.studentHealthIncident.findFirst({ where: { id: req.params.incidentId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true, studentId: true, escalationLevel: true, status: true } }));
  let queued = 0;
  if (row) queued = await withTenantContext(prisma, s, async tx => { const links = await tx.studentGuardian.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: row.studentId, canReceiveCommunications: true }, select: { guardianId: true } }); let count = 0; for (const link of links) { const consent = await tx.studentHealthConsent.findFirst({ where: { organizationId: s.organizationId, schoolId: s.schoolId, studentId: row.studentId, guardianId: link.guardianId, grantedAt: { not: null }, revokedAt: null }, select: { id: true } }); if (consent) { await tx.studentHealthIncidentNotification.createMany({ data: [{ organizationId: s.organizationId, schoolId: s.schoolId, incidentId: row.id, guardianId: link.guardianId, eventType: "HEALTH_INCIDENT_ESCALATED" }], skipDuplicates: true }); count++; } } return count; });
  await audit(s, "health.incident.escalation.notifications", "StudentHealthIncidentNotification", req.params.incidentId, "SUCCESS", { queuedCount: queued }); return res.json({ data: row, guardianNotificationsQueued: queued });
}));
