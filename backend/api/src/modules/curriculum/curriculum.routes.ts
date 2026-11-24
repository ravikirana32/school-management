import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";
import { boardCatalogue } from "./curriculum.catalogue.js";
import { boardCurriculumPacks, getBoardCurriculumPack } from "./board-packs.catalogue.js";
import { outcomeReviewTransitionAllowed } from "./outcome-review.js";
import { validateOutcomeExamAlignment } from "./outcome-assessment-mapping.js";
import { buildOutcomeCoverageDashboard } from "./outcome-coverage.js";
import { outcomeCsvHeaders, parseCsv, rowsToCsv } from "./outcomes-csv.js";
import { boardProfileSchema, curriculumSubjectSchema, curriculumVersionSchema, gradeSchema, curriculumOutcomeSchema, curriculumOutcomeReviewSchema, curriculumOutcomeUpdateSchema } from "./curriculum.schemas.js";

export const curriculumRouter = Router();
curriculumRouter.use(authenticate);
function asyncRoute(fn: (req: any, res: any) => Promise<unknown>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);
}
async function scope(req: any, res: any, permission = "academics.read") {
  const organizationId = String(req.params.organizationId || "");
  const schoolId = String(req.params.schoolId || "");
  const userId = req.auth!.userId;
  if (!await hasActiveSchoolMembership(userId, organizationId, schoolId)) {
    res.status(403).json({ error: "Active school membership required" }); return null;
  }
  if (!await hasSchoolPermission(userId, organizationId, schoolId, permission)) { res.status(403).json({ error: `Missing required permission: ${permission}` }); return null; }
  return { organizationId, schoolId, userId };
}
async function admin(s: { organizationId: string; schoolId: string; userId: string }, res: any) {
  if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, "academics.manage")) {
    res.status(403).json({ error: "Missing required permission: academics.manage" }); return false;
  }
  return true;
}
async function entitlement(organizationId: string, schoolId: string) {
  return withTenantContext(prisma, { organizationId, schoolId }, async tx => {
    const subscription = await tx.organizationSubscription.findFirst({
      where: { organizationId, status: { in: ["TRIALING","ACTIVE","PAST_DUE"] }, currentPeriodEndsAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    });
    if (!subscription) return false;
    const plan = await tx.subscriptionPlan.findUnique({ where: { id: subscription.planId } });
    return (plan?.entitlements as Record<string, unknown> | null)?.curriculumConfiguration === true;
  });
}
const asDate = (v?: string) => v ? new Date(`${v}T00:00:00.000Z`) : undefined;

curriculumRouter.get("/catalogue", asyncRoute(async (_req, res) => res.json({ data: boardCatalogue })));

// P411: starter board pack metadata is read-only and deliberately not presented as official syllabi.
curriculumRouter.get("/catalogue/board-packs", asyncRoute(async (_req, res) => {
  res.json({ data: boardCurriculumPacks, contentStatus: "STARTER_METADATA", officialContentIncluded: false });
}));

curriculumRouter.get("/catalogue/board-packs/:boardKey", asyncRoute(async (req, res) => {
  const pack = getBoardCurriculumPack(String(req.params.boardKey || "").toUpperCase());
  if (!pack) return res.status(404).json({ error: "Board curriculum starter pack not found" });
  return res.json({ data: pack, contentStatus: "STARTER_METADATA", officialContentIncluded: false });
}));

curriculumRouter.get("/:organizationId/:schoolId/board", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const data = await withTenantContext(prisma, s, tx => tx.schoolBoardProfile.findUnique({ where: { schoolId: s.schoolId } }));
  return res.json({ data });
}));

curriculumRouter.put("/:organizationId/:schoolId/board", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const parsed = boardProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid board profile", details: parsed.error.flatten() });
  const catalogueEntry = boardCatalogue.find(x => x.key === parsed.data.boardKey);
  const boardName = parsed.data.boardName ?? catalogueEntry?.name ?? "Custom curriculum";
  const data = await withTenantContext(prisma, s, tx => tx.schoolBoardProfile.upsert({
    where: { schoolId: s.schoolId },
    create: {
      organizationId: s.organizationId, schoolId: s.schoolId, ...parsed.data,
      boardName, effectiveFrom: asDate(parsed.data.effectiveFrom), effectiveTo: asDate(parsed.data.effectiveTo),
      createdBy: s.userId
    },
    update: {
      ...parsed.data, boardName, effectiveFrom: asDate(parsed.data.effectiveFrom), effectiveTo: asDate(parsed.data.effectiveTo)
    }
  }));
  return res.json({ data });
}));

curriculumRouter.get("/:organizationId/:schoolId/grades", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const data = await withTenantContext(prisma, s, tx => tx.gradeLevel.findMany({
    where: { organizationId: s.organizationId, schoolId: s.schoolId },
    orderBy: { sequence: "asc" }
  }));
  return res.json({ data });
}));

curriculumRouter.post("/:organizationId/:schoolId/grades", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const parsed = gradeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid grade level", details: parsed.error.flatten() });
  const data = await withTenantContext(prisma, s, tx => tx.gradeLevel.create({
    data: { ...parsed.data, organizationId: s.organizationId, schoolId: s.schoolId }
  }));
  return res.status(201).json({ data });
}));

curriculumRouter.get("/:organizationId/:schoolId/versions", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const data = await withTenantContext(prisma, s, tx => tx.curriculumVersion.findMany({
    where: { organizationId: s.organizationId, schoolId: s.schoolId },
    orderBy: [{ effectiveFrom: "desc" }, { createdAt: "desc" }]
  }));
  return res.json({ data });
}));

curriculumRouter.post("/:organizationId/:schoolId/versions", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const parsed = curriculumVersionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid curriculum version", details: parsed.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    if (parsed.data.academicYearId) {
      const year = await tx.academicYear.findFirst({ where: { id: parsed.data.academicYearId, schoolId: s.schoolId, organizationId: s.organizationId } });
      if (!year) return null;
    }
    return tx.curriculumVersion.create({
      data: { ...parsed.data, organizationId: s.organizationId, schoolId: s.schoolId,
        effectiveFrom: asDate(parsed.data.effectiveFrom), effectiveTo: asDate(parsed.data.effectiveTo), createdBy: s.userId }
    });
  });
  if (!data) return res.status(404).json({ error: "Academic year not found for this school" });
  return res.status(201).json({ data });
}));

curriculumRouter.patch("/:organizationId/:schoolId/versions/:versionId/status", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  const status = req.body?.status;
  if (status !== "ACTIVE" && status !== "RETIRED" && status !== "DRAFT") return res.status(400).json({ error: "Status must be DRAFT, ACTIVE or RETIRED" });
  const data = await withTenantContext(prisma, s, async tx => {
    const version = await tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!version) return null;
    if (status === "ACTIVE") {
      // Serialize activation per school/year; the partial unique index is the final DB guard.
      const lockKey = `${s.organizationId}:${s.schoolId}:${version.academicYearId ?? "NO_YEAR"}`;
      await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", lockKey);
      await tx.curriculumVersion.updateMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, academicYearId: version.academicYearId, status: "ACTIVE", id: { not: version.id } }, data: { status: "RETIRED" } });
    }
    return tx.curriculumVersion.update({ where: { id: version.id }, data: { status } });
  });
  if (!data) return res.status(404).json({ error: "Curriculum version not found in this school" });
  return res.json({ data });
}));


// P415: CSV bulk outcomes administration. Preview and commit share the same validator.
const outcomeImportLimit = 500;
async function validateOutcomeCsv(tx: any, csvText: string, versionId: string, scopeIds: { organizationId: string; schoolId: string }) {
  let parsedRows: string[][];
  try { parsedRows = parseCsv(csvText); } catch (error) { return { validRows: [], issues: [{ row: 1, field: "file", message: error instanceof Error ? error.message : "Malformed CSV" }] }; }
  if (!parsedRows.length) return { validRows: [], issues: [{ row: 1, field: "header", message: "CSV is empty" }] };
  const header = parsedRows[0].map(v => v.trim());
  const duplicateHeaders = header.filter((value, index) => value && header.indexOf(value) !== index);
  if (duplicateHeaders.length) return { validRows: [], issues: [...new Set(duplicateHeaders)].map(field => ({ row: 1, field, message: `Duplicate CSV column: ${field}` })) };
  const missing = outcomeCsvHeaders.filter(name => !header.includes(name));
  if (missing.length) return { validRows: [], issues: missing.map(field => ({ row: 1, field, message: `Missing required CSV column: ${field}` })) };
  const dataRows = parsedRows.slice(1);
  if (dataRows.length > outcomeImportLimit) return { validRows: [], issues: [{ row: 1, field: "file", message: `Import is limited to ${outcomeImportLimit} rows per file` }] };
  const gradeCache = new Map<string, any>();
  const subjectCache = new Map<string, any>();
  const duplicateKeys = new Set<string>();
  const validRows: any[] = [];
  const issues: Array<{ row: number; field: string; message: string }> = [];
  for (const [index, values] of dataRows.entries()) {
    const rowNumber = index + 2;
    const record = Object.fromEntries(header.map((key, i) => [key, String(values[i] ?? "").trim()])) as Record<string, string>;
    const gradeCode = record.gradeCode;
    const code = record.code;
    if (!gradeCode) issues.push({ row: rowNumber, field: "gradeCode", message: "Grade code is required" });
    if (!code) issues.push({ row: rowNumber, field: "code", message: "Outcome code is required" });
    if (!record.title || record.title.length < 3) issues.push({ row: rowNumber, field: "title", message: "Title must contain at least 3 characters" });
    if (!record.provenanceNote || record.provenanceNote.length < 3) issues.push({ row: rowNumber, field: "provenanceNote", message: "Provenance note is required (at least 3 characters)" });
    if (issues.some(issue => issue.row === rowNumber)) continue;
    const grade = gradeCache.has(gradeCode) ? gradeCache.get(gradeCode) : await tx.gradeLevel.findFirst({ where: { organizationId: scopeIds.organizationId, schoolId: scopeIds.schoolId, code: gradeCode, isActive: true } });
    gradeCache.set(gradeCode, grade);
    if (!grade) { issues.push({ row: rowNumber, field: "gradeCode", message: `Active grade '${gradeCode}' not found in this school` }); continue; }
    let subjectId: string | undefined;
    if (record.subjectCode) {
      const subjectKey = `${grade.id}:${record.subjectCode}`;
      const subject = subjectCache.has(subjectKey) ? subjectCache.get(subjectKey) : await tx.curriculumSubject.findFirst({ where: { organizationId: scopeIds.organizationId, schoolId: scopeIds.schoolId, curriculumVersionId: versionId, gradeLevelId: grade.id, code: record.subjectCode } });
      subjectCache.set(subjectKey, subject);
      if (!subject) { issues.push({ row: rowNumber, field: "subjectCode", message: `Subject '${record.subjectCode}' not found for grade '${gradeCode}' and selected curriculum` }); continue; }
      subjectId = subject.id;
    }
    const key = `${grade.id}:${code.toLocaleLowerCase()}`;
    if (duplicateKeys.has(key)) { issues.push({ row: rowNumber, field: "code", message: "Duplicate outcome code in this CSV for the grade" }); continue; }
    duplicateKeys.add(key);
    const duplicateDb = await tx.curriculumOutcome.findFirst({ where: { organizationId: scopeIds.organizationId, schoolId: scopeIds.schoolId, curriculumVersionId: versionId, gradeLevelId: grade.id, code } });
    if (duplicateDb) { issues.push({ row: rowNumber, field: "code", message: `Outcome code '${code}' already exists for this grade and curriculum version` }); continue; }
    const payload: Record<string, unknown> = { gradeLevelId: grade.id, code, title: record.title, provenanceNote: record.provenanceNote };
    if (subjectId) payload.curriculumSubjectId = subjectId;
    for (const field of ["description", "competencyDomain", "sourceReference", "sourceEdition", "sourceUrl"] as const) if (record[field]) payload[field] = record[field];
    const schemaResult = curriculumOutcomeSchema.safeParse(payload);
    if (!schemaResult.success) { issues.push({ row: rowNumber, field: "row", message: schemaResult.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ") }); continue; }
    validRows.push({ ...schemaResult.data, _csvRow: rowNumber });
  }
  return { validRows, issues };
}


// P412: school-owned curriculum outcomes with source provenance and review workflow.
curriculumRouter.get("/:organizationId/:schoolId/versions/:versionId/outcomes/import-template", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const version = await withTenantContext(prisma, s, tx => tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } }));
  if (!version) return res.status(404).json({ error: "Curriculum version not found" });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=curriculum-outcomes-import-template.csv");
  return res.send(`${outcomeCsvHeaders.join(",")}\r\n`);
}));

curriculumRouter.get("/:organizationId/:schoolId/versions/:versionId/outcomes/export", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const version = await withTenantContext(prisma, s, tx => tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } }));
  if (!version) return res.status(404).json({ error: "Curriculum version not found" });
  const reviewStatus = req.query.reviewStatus;
  if (reviewStatus && !["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED"].includes(String(reviewStatus))) return res.status(400).json({ error: "Invalid review status filter" });
  const gradeCode = typeof req.query.gradeCode === "string" ? req.query.gradeCode : undefined;
  const rows = await withTenantContext(prisma, s, async tx => {
    const grades = gradeCode ? await tx.gradeLevel.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, code: gradeCode } }) : [];
    if (gradeCode && !grades.length) return null;
    const outcomes = await tx.curriculumOutcome.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, ...(reviewStatus ? { reviewStatus: String(reviewStatus) as any } : {}), ...(gradeCode ? { gradeLevelId: grades[0].id } : {}) }, orderBy: [{ gradeLevelId: "asc" }, { code: "asc" }] });
    const allGrades = gradeCode ? grades : await tx.gradeLevel.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId } });
    const gradeById = new Map(allGrades.map((g: any) => [g.id, g.code]));
    const subjects = await tx.curriculumSubject.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id } });
    const subjectById = new Map(subjects.map((subject: any) => [subject.id, subject.code]));
    return outcomes.map((o: any) => ({ gradeCode: gradeById.get(o.gradeLevelId) ?? "", subjectCode: o.curriculumSubjectId ? subjectById.get(o.curriculumSubjectId) ?? "" : "", code: o.code, title: o.title, description: o.description ?? "", competencyDomain: o.competencyDomain ?? "", sourceReference: o.sourceReference ?? "", sourceEdition: o.sourceEdition ?? "", sourceUrl: o.sourceUrl ?? "", provenanceNote: o.provenanceNote }));
  });
  if (rows === null) return res.status(404).json({ error: "Grade code not found in this school" });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=curriculum-outcomes-${req.params.versionId}.csv`);
  return res.send(rowsToCsv(rows));
}));

curriculumRouter.post("/:organizationId/:schoolId/versions/:versionId/outcomes/import-preview", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const csvText = req.body?.csvText;
  if (typeof csvText !== "string" || csvText.length === 0) return res.status(400).json({ error: "csvText is required" });
  if (csvText.length > 1_500_000) return res.status(413).json({ error: "CSV content exceeds 1.5 MB" });
  const version = await withTenantContext(prisma, s, tx => tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } }));
  if (!version) return res.status(404).json({ error: "Curriculum version not found" });
  const result = await withTenantContext(prisma, s, tx => validateOutcomeCsv(tx, csvText, version.id, s));
  let totalRows = 0; try { totalRows = Math.max(0, parseCsv(csvText).length - 1); } catch { totalRows = 0; }
  return res.json({ data: { validCount: result.validRows.length, invalidCount: result.issues.length, totalRows, validRows: result.validRows.map(({ _csvRow, ...row }: any) => ({ row: _csvRow, ...row })), issues: result.issues } });
}));

curriculumRouter.post("/:organizationId/:schoolId/versions/:versionId/outcomes/import", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const csvText = req.body?.csvText;
  if (typeof csvText !== "string" || csvText.length === 0) return res.status(400).json({ error: "csvText is required" });
  if (csvText.length > 1_500_000) return res.status(413).json({ error: "CSV content exceeds 1.5 MB" });
  const version = await withTenantContext(prisma, s, tx => tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } }));
  if (!version) return res.status(404).json({ error: "Curriculum version not found" });
  const result = await withTenantContext(prisma, s, tx => validateOutcomeCsv(tx, csvText, version.id, s));
  if (result.issues.length) return res.status(422).json({ error: "Import contains validation errors; no rows were created", data: { validCount: result.validRows.length, invalidCount: result.issues.length, issues: result.issues } });
  const created = await withTenantContext(prisma, s, async tx => {
    const finalCheck = await validateOutcomeCsv(tx, csvText, version.id, s);
    if (finalCheck.issues.length) return { conflict: finalCheck.issues };
    const data = finalCheck.validRows.map(({ _csvRow, ...row }: any) => ({ ...row, organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, createdBy: s.userId }));
    const outcome = await tx.curriculumOutcome.createMany({ data });
    return { count: outcome.count };
  });
  if ((created as any).conflict) return res.status(409).json({ error: "Outcome data changed since preview; run preview again", data: { issues: (created as any).conflict } });
  return res.status(201).json({ data: { createdCount: (created as any).count, reviewStatus: "DRAFT", message: "Imported outcomes remain in DRAFT and are not automatically approved." } });
}));

// P417: version-scoped outcome-to-assessment coverage dashboard data.
curriculumRouter.get("/:organizationId/:schoolId/versions/:versionId/outcome-assessment-coverage", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const reviewStatus = req.query.reviewStatus;
  if (reviewStatus && !["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED"].includes(String(reviewStatus))) return res.status(400).json({ error: "Invalid review status filter" });
  const gradeLevelId = typeof req.query.gradeLevelId === "string" ? req.query.gradeLevelId : undefined;
  const curriculumSubjectId = typeof req.query.curriculumSubjectId === "string" ? req.query.curriculumSubjectId : undefined;
  const data = await withTenantContext(prisma, s, async tx => {
    const version = await tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!version) return null;
    const outcomes = await tx.curriculumOutcome.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, ...(reviewStatus ? { reviewStatus: String(reviewStatus) as any } : {}), ...(gradeLevelId ? { gradeLevelId } : {}), ...(curriculumSubjectId ? { curriculumSubjectId } : {}) }, orderBy: [{ gradeLevelId: "asc" }, { code: "asc" }] });
    const mappings = outcomes.length ? await tx.curriculumOutcomeAssessmentMapping.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, outcomeId: { in: outcomes.map((o: any) => o.id) } } }) : [];
    const gradeIdsForExams = [...new Set(outcomes.map((o: any) => o.gradeLevelId))] as string[];
    const exams = gradeIdsForExams.length ? await tx.schoolAssessmentExam.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, gradeLevelId: { in: gradeIdsForExams }, ...(version.academicYearId ? { academicYearId: version.academicYearId } : {}) }, select: { id: true, gradeLevelId: true, subjectName: true, examName: true, status: true } }) : [];
    const subjectIds = [...new Set(outcomes.map((o: any) => o.curriculumSubjectId).filter(Boolean))] as string[];
    const subjects = subjectIds.length ? await tx.curriculumSubject.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, id: { in: subjectIds } }, select: { id: true, gradeLevelId: true, name: true, code: true } }) : [];
    const gradeIds = [...new Set(outcomes.map((o: any) => o.gradeLevelId))] as string[];
    const grades = gradeIds.length ? await tx.gradeLevel.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, id: { in: gradeIds } }, select: { id: true, name: true, sequence: true }, orderBy: { sequence: "asc" } }) : [];
    return buildOutcomeCoverageDashboard(outcomes, mappings, exams, subjects, grades);
  });
  if (!data) return res.status(404).json({ error: "Curriculum version not found in this school" });
  return res.json({ data });
}));

curriculumRouter.get("/:organizationId/:schoolId/versions/:versionId/outcomes", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const version = await withTenantContext(prisma, s, tx => tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } }));
  if (!version) return res.status(404).json({ error: "Curriculum version not found" });
  const reviewStatus = req.query.reviewStatus;
  if (reviewStatus && !["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED"].includes(String(reviewStatus))) return res.status(400).json({ error: "Invalid review status filter" });
  const data = await withTenantContext(prisma, s, tx => tx.curriculumOutcome.findMany({
    where: { organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, ...(reviewStatus ? { reviewStatus: String(reviewStatus) as any } : {}) },
    orderBy: [{ gradeLevelId: "asc" }, { code: "asc" }]
  }));
  return res.json({ data });
}));

curriculumRouter.post("/:organizationId/:schoolId/versions/:versionId/outcomes", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const parsed = curriculumOutcomeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid curriculum outcome", details: parsed.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    const version = await tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } });
    const grade = await tx.gradeLevel.findFirst({ where: { id: parsed.data.gradeLevelId, organizationId: s.organizationId, schoolId: s.schoolId, isActive: true } });
    if (!version || !grade) return null;
    if (parsed.data.curriculumSubjectId) {
      const subject = await tx.curriculumSubject.findFirst({ where: { id: parsed.data.curriculumSubjectId, curriculumVersionId: version.id, gradeLevelId: grade.id, organizationId: s.organizationId, schoolId: s.schoolId } });
      if (!subject) return null;
    }
    return tx.curriculumOutcome.create({ data: { ...parsed.data, organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, provenanceNote: parsed.data.provenanceNote, createdBy: s.userId } });
  });
  if (!data) return res.status(404).json({ error: "Curriculum version, active grade, or matching subject not found" });
  return res.status(201).json({ data });
}));

// P414: editable outcomes are restricted to draft/in-review records; approved/archived outcomes must return to review first.
curriculumRouter.patch("/:organizationId/:schoolId/outcomes/:outcomeId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const parsed = curriculumOutcomeUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid curriculum outcome update", details: parsed.error.flatten() });
  const result = await withTenantContext(prisma, s, async tx => {
    const outcome = await tx.curriculumOutcome.findFirst({ where: { id: req.params.outcomeId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!outcome) return { notFound: true };
    if (!["DRAFT", "IN_REVIEW"].includes(outcome.reviewStatus)) return { locked: true };
    const gradeLevelId = parsed.data.gradeLevelId ?? outcome.gradeLevelId;
    const curriculumSubjectId = parsed.data.curriculumSubjectId === undefined ? outcome.curriculumSubjectId : parsed.data.curriculumSubjectId;
    const grade = await tx.gradeLevel.findFirst({ where: { id: gradeLevelId, organizationId: s.organizationId, schoolId: s.schoolId, isActive: true } });
    if (!grade) return { invalidScope: true };
    if (curriculumSubjectId) {
      const subject = await tx.curriculumSubject.findFirst({ where: { id: curriculumSubjectId, curriculumVersionId: outcome.curriculumVersionId, gradeLevelId, organizationId: s.organizationId, schoolId: s.schoolId } });
      if (!subject) return { invalidScope: true };
    }
    const data = { ...parsed.data, curriculumSubjectId, gradeLevelId };
    const duplicate = await tx.curriculumOutcome.findFirst({ where: { organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: outcome.curriculumVersionId, gradeLevelId, code: data.code ?? outcome.code, id: { not: outcome.id } } });
    if (duplicate) return { conflict: true };
    return tx.curriculumOutcome.update({ where: { id: outcome.id }, data });
  });
  if ((result as any).notFound) return res.status(404).json({ error: "Curriculum outcome not found" });
  if ((result as any).locked) return res.status(409).json({ error: "Approved or archived outcomes must be returned to review before editing" });
  if ((result as any).invalidScope) return res.status(400).json({ error: "Grade or subject must belong to this school and curriculum version" });
  if ((result as any).conflict) return res.status(409).json({ error: "Outcome code already exists for this grade and curriculum version" });
  return res.json({ data: result });
}));

// P414: hard-delete is intentionally limited to draft records to preserve reviewed curriculum evidence.
curriculumRouter.delete("/:organizationId/:schoolId/outcomes/:outcomeId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const result = await withTenantContext(prisma, s, async tx => {
    const outcome = await tx.curriculumOutcome.findFirst({ where: { id: req.params.outcomeId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!outcome) return { notFound: true };
    if (outcome.reviewStatus !== "DRAFT") return { locked: true };
    await tx.curriculumOutcome.delete({ where: { id: outcome.id } });
    return { deleted: true };
  });
  if ((result as any).notFound) return res.status(404).json({ error: "Curriculum outcome not found" });
  if ((result as any).locked) return res.status(409).json({ error: "Only draft outcomes can be deleted; reviewed outcomes must be archived" });
  return res.json({ data: result });
}));

curriculumRouter.patch("/:organizationId/:schoolId/outcomes/:outcomeId/review", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const parsed = curriculumOutcomeReviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid outcome review request", details: parsed.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    const outcome = await tx.curriculumOutcome.findFirst({ where: { id: req.params.outcomeId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!outcome) return null;
    if (!outcomeReviewTransitionAllowed(outcome.reviewStatus, parsed.data.reviewStatus)) return { invalidTransition: true };
    const approving = parsed.data.reviewStatus === "APPROVED";
    return tx.curriculumOutcome.update({ where: { id: outcome.id }, data: { reviewStatus: parsed.data.reviewStatus, reviewedBy: approving ? s.userId : null, reviewedAt: approving ? new Date() : null } });
  });
  if (!data) return res.status(404).json({ error: "Curriculum outcome not found" });
  if ((data as any).invalidTransition) return res.status(409).json({ error: "Invalid curriculum outcome review transition" });
  return res.json({ data });
}));

// P416: outcome-to-assessment alignment. Exams are referenced only within the same school/tenant.
curriculumRouter.get("/:organizationId/:schoolId/outcomes/:outcomeId/assessment-mappings", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const data = await withTenantContext(prisma, s, async tx => {
    const outcome = await tx.curriculumOutcome.findFirst({ where: { id: req.params.outcomeId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!outcome) return null;
    const mappings = await tx.curriculumOutcomeAssessmentMapping.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, outcomeId: outcome.id }, orderBy: { createdAt: "desc" } });
    const exams = mappings.length ? await tx.schoolAssessmentExam.findMany({ where: { id: { in: mappings.map((mapping: any) => mapping.examId) }, organizationId: s.organizationId, schoolId: s.schoolId } }) : [];
    const byId = new Map(exams.map((exam: any) => [exam.id, exam]));
    return mappings.map((mapping: any) => ({ ...mapping, exam: byId.get(mapping.examId) ?? null }));
  });
  if (!data) return res.status(404).json({ error: "Curriculum outcome not found" });
  return res.json({ data });
}));

curriculumRouter.post("/:organizationId/:schoolId/outcomes/:outcomeId/assessment-mappings", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const examId = typeof req.body?.examId === "string" ? req.body.examId.trim() : "";
  if (!examId) return res.status(400).json({ error: "examId is required" });
  const result = await withTenantContext(prisma, s, async tx => {
    const outcome = await tx.curriculumOutcome.findFirst({ where: { id: req.params.outcomeId, organizationId: s.organizationId, schoolId: s.schoolId } });
    const exam = await tx.schoolAssessmentExam.findFirst({ where: { id: examId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!outcome || !exam) return { notFound: true };
    const subject = outcome.curriculumSubjectId ? await tx.curriculumSubject.findFirst({ where: { id: outcome.curriculumSubjectId, curriculumVersionId: outcome.curriculumVersionId, gradeLevelId: outcome.gradeLevelId, organizationId: s.organizationId, schoolId: s.schoolId } }) : null;
    if (outcome.curriculumSubjectId && !subject) return { invalidScope: true };
    const alignment = validateOutcomeExamAlignment({ outcomeGradeLevelId: outcome.gradeLevelId, examGradeLevelId: exam.gradeLevelId, outcomeSubjectName: subject?.name, outcomeSubjectCode: subject?.code, examSubjectName: exam.subjectName });
    if (!alignment.valid) return { invalidAlignment: alignment.reason };
    const existing = await tx.curriculumOutcomeAssessmentMapping.findFirst({ where: { organizationId: s.organizationId, schoolId: s.schoolId, outcomeId: outcome.id, examId: exam.id } });
    if (existing) return { duplicate: true };
    return tx.curriculumOutcomeAssessmentMapping.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, outcomeId: outcome.id, examId: exam.id, createdBy: s.userId } });
  });
  if ((result as any).notFound) return res.status(404).json({ error: "Outcome or exam not found in this school" });
  if ((result as any).invalidScope) return res.status(409).json({ error: "Outcome subject is no longer valid for its curriculum version and grade" });
  if ((result as any).invalidAlignment) return res.status(400).json({ error: (result as any).invalidAlignment });
  if ((result as any).duplicate) return res.status(409).json({ error: "This outcome is already mapped to the selected exam" });
  return res.status(201).json({ data: result });
}));

curriculumRouter.delete("/:organizationId/:schoolId/assessment-mappings/:mappingId", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const deleted = await withTenantContext(prisma, s, async tx => tx.curriculumOutcomeAssessmentMapping.deleteMany({ where: { id: req.params.mappingId, organizationId: s.organizationId, schoolId: s.schoolId } }));
  if (!deleted.count) return res.status(404).json({ error: "Assessment mapping not found" });
  return res.json({ data: { deleted: true } });
}));


// P418: lesson planning linked to curriculum outcomes.
const lessonStatuses = ["DRAFT", "PLANNED", "COMPLETED", "ARCHIVED"] as const;
function lessonPlanPayload(body: any) {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const outcomes = Array.isArray(body?.outcomeIds) ? body.outcomeIds.filter((x: unknown) => typeof x === "string" && x.trim()).map((x: string) => x.trim()) : [];
  const duration = body?.durationMinutes === null || body?.durationMinutes === undefined || body?.durationMinutes === "" ? null : Number(body.durationMinutes);
  if (title.length < 3 || title.length > 180) return { error: "Lesson title must be between 3 and 180 characters" };
  if (duration !== null && (!Number.isInteger(duration) || duration < 1 || duration > 600)) return { error: "Duration must be between 1 and 600 minutes" };
  if (body?.status !== undefined && !lessonStatuses.includes(body.status)) return { error: "Invalid lesson plan status" };
  return { data: { title, objectives: body.objectives?.trim() || null, description: body.description?.trim() || null, resources: body.resources?.trim() || null, plannedDate: body.plannedDate ? asDate(String(body.plannedDate)) : null, durationMinutes: duration, status: body.status || "DRAFT", gradeLevelId: String(body.gradeLevelId || ""), curriculumSubjectId: body.curriculumSubjectId ? String(body.curriculumSubjectId) : null, outcomeIds: [...new Set(outcomes)] } };
}

curriculumRouter.get("/:organizationId/:schoolId/versions/:versionId/lesson-plans", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const data = await withTenantContext(prisma, s, async tx => {
    const version = await tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!version) return null;
    const plans = await tx.curriculumLessonPlan.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, ...(req.query.gradeLevelId ? { gradeLevelId: String(req.query.gradeLevelId) } : {}), ...(req.query.status && lessonStatuses.includes(String(req.query.status) as any) ? { status: String(req.query.status) } : {}) }, orderBy: [{ plannedDate: "asc" }, { createdAt: "desc" }] });
    const links = plans.length ? await tx.curriculumLessonPlanOutcome.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: { in: plans.map((p: any) => p.id) } } }) : [];
    const outcomes = links.length ? await tx.curriculumOutcome.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, id: { in: links.map((l: any) => l.outcomeId) } } }) : [];
    const outcomeById = new Map(outcomes.map((o: any) => [o.id, o])); const linksByPlan = new Map<string, any[]>();
    for (const link of links) { const bucket = linksByPlan.get(link.lessonPlanId) || []; const outcome = outcomeById.get(link.outcomeId); if (outcome) bucket.push(outcome); linksByPlan.set(link.lessonPlanId, bucket); }
    return plans.map((plan: any) => ({ ...plan, outcomes: linksByPlan.get(plan.id) || [] }));
  });
  if (!data) return res.status(404).json({ error: "Curriculum version not found" }); return res.json({ data });
}));

curriculumRouter.post("/:organizationId/:schoolId/versions/:versionId/lesson-plans", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const parsed = lessonPlanPayload(req.body); if (parsed.error) return res.status(400).json({ error: parsed.error });
  const p = parsed.data!;
  const result = await withTenantContext(prisma, s, async tx => {
    const version = await tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } });
    const grade = await tx.gradeLevel.findFirst({ where: { id: p.gradeLevelId, organizationId: s.organizationId, schoolId: s.schoolId, isActive: true } });
    if (!version || !grade) return { notFound: true };
    const subject = p.curriculumSubjectId ? await tx.curriculumSubject.findFirst({ where: { id: p.curriculumSubjectId, organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, gradeLevelId: grade.id } }) : null;
    if (p.curriculumSubjectId && !subject) return { invalidSubject: true };
    const outcomes = p.outcomeIds.length ? await tx.curriculumOutcome.findMany({ where: { id: { in: p.outcomeIds }, organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, gradeLevelId: grade.id, ...(subject ? { OR: [{ curriculumSubjectId: subject.id }, { curriculumSubjectId: null }] } : {}) } }) : [];
    if (outcomes.length !== p.outcomeIds.length) return { invalidOutcomes: true };
    const plan = await tx.curriculumLessonPlan.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: version.id, gradeLevelId: grade.id, curriculumSubjectId: subject?.id ?? null, title: p.title, objectives: p.objectives, description: p.description, plannedDate: p.plannedDate, durationMinutes: p.durationMinutes, resources: p.resources, status: p.status, createdBy: s.userId } });
    if (outcomes.length) await tx.curriculumLessonPlanOutcome.createMany({ data: outcomes.map((outcome: any) => ({ organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: plan.id, outcomeId: outcome.id })) });
    return { ...plan, outcomes };
  });
  if ((result as any).notFound) return res.status(404).json({ error: "Curriculum version or grade not found" });
  if ((result as any).invalidSubject) return res.status(400).json({ error: "Subject must belong to the selected version and grade" });
  if ((result as any).invalidOutcomes) return res.status(400).json({ error: "All linked outcomes must belong to the selected curriculum version and grade" });
  return res.status(201).json({ data: result });
}));

curriculumRouter.patch("/:organizationId/:schoolId/lesson-plans/:lessonPlanId", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const parsed = lessonPlanPayload({ ...req.body, gradeLevelId: req.body?.gradeLevelId ?? "" }); if (parsed.error) return res.status(400).json({ error: parsed.error }); const p = parsed.data!;
  const result = await withTenantContext(prisma, s, async tx => {
    const existing = await tx.curriculumLessonPlan.findFirst({ where: { id: req.params.lessonPlanId, organizationId: s.organizationId, schoolId: s.schoolId } }); if (!existing) return { notFound: true };
    if (existing.status === "COMPLETED" || existing.status === "ARCHIVED") return { locked: true };
    const gradeId = req.body.gradeLevelId ? p.gradeLevelId : existing.gradeLevelId; const subjectId = req.body.curriculumSubjectId !== undefined ? p.curriculumSubjectId : existing.curriculumSubjectId;
    const grade = await tx.gradeLevel.findFirst({ where: { id: gradeId, organizationId: s.organizationId, schoolId: s.schoolId, isActive: true } }); if (!grade) return { notFound: true };
    const subject = subjectId ? await tx.curriculumSubject.findFirst({ where: { id: subjectId, organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: existing.curriculumVersionId, gradeLevelId: grade.id } }) : null; if (subjectId && !subject) return { invalidSubject: true };
    const outcomes = p.outcomeIds.length ? await tx.curriculumOutcome.findMany({ where: { id: { in: p.outcomeIds }, organizationId: s.organizationId, schoolId: s.schoolId, curriculumVersionId: existing.curriculumVersionId, gradeLevelId: grade.id, ...(subject ? { OR: [{ curriculumSubjectId: subject.id }, { curriculumSubjectId: null }] } : {}) } }) : []; if (outcomes.length !== p.outcomeIds.length) return { invalidOutcomes: true };
    const updated = await tx.curriculumLessonPlan.update({ where: { id: existing.id }, data: { title: p.title, objectives: p.objectives, description: p.description, plannedDate: p.plannedDate, durationMinutes: p.durationMinutes, resources: p.resources, status: p.status, gradeLevelId: grade.id, curriculumSubjectId: subject?.id ?? null } });
    await tx.curriculumLessonPlanOutcome.deleteMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: existing.id } }); if (outcomes.length) await tx.curriculumLessonPlanOutcome.createMany({ data: outcomes.map((o: any) => ({ organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: existing.id, outcomeId: o.id })) }); return { ...updated, outcomes };
  });
  if ((result as any).notFound) return res.status(404).json({ error: "Lesson plan or grade not found" }); if ((result as any).locked) return res.status(409).json({ error: "Completed or archived lesson plans cannot be edited" }); if ((result as any).invalidSubject) return res.status(400).json({ error: "Subject must belong to the selected version and grade" }); if ((result as any).invalidOutcomes) return res.status(400).json({ error: "Outcome links must match the selected grade and version" }); return res.json({ data: result });
}));

// P420 lesson-plan teacher assignments: active teaching staff only, scoped to the school.
curriculumRouter.get("/:organizationId/:schoolId/lesson-plan-teachers", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const data = await withTenantContext(prisma, s, async tx => {
    const designations = await tx.staffDesignation.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, isActive: true, isTeachingRole: true }, select: { id: true } });
    if (!designations.length) return [];
    return tx.staffMember.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE", designationId: { in: designations.map((d: any) => d.id) } }, select: { id: true, employeeNumber: true, firstName: true, lastName: true, preferredName: true, designationId: true }, orderBy: [{ firstName: "asc", lastName: "asc" }] });
  });
  return res.json({ data });
}));

curriculumRouter.get("/:organizationId/:schoolId/lesson-plan-teacher-assignments", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const data = await withTenantContext(prisma, s, async tx => {
    const assignments = await tx.curriculumLessonPlanTeacherAssignment.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!assignments.length) return [];
    const staff = await tx.staffMember.findMany({ where: { id: { in: [...new Set(assignments.map((a: any) => a.staffMemberId))] }, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true, firstName: true, lastName: true, preferredName: true } });
    const staffById = new Map(staff.map((t: any) => [t.id, t]));
    return assignments.map((a: any) => ({ ...a, staff: staffById.get(a.staffMemberId) || null }));
  });
  return res.json({ data });
}));

curriculumRouter.put("/:organizationId/:schoolId/lesson-plans/:lessonPlanId/teachers", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const staffIds: string[] = Array.isArray(req.body?.staffIds) ? Array.from(new Set((req.body.staffIds as unknown[]).filter((x): x is string => typeof x === "string" && x.trim().length > 0).map(x => x.trim()))) : [];
  const primaryStaffId = typeof req.body?.primaryStaffId === "string" && req.body.primaryStaffId.trim() ? req.body.primaryStaffId.trim() : null;
  if (staffIds.length > 20 || (primaryStaffId && !staffIds.includes(primaryStaffId))) return res.status(400).json({ error: "Primary teacher must be one of the assigned teachers; maximum 20 teachers." });
  const result = await withTenantContext(prisma, s, async tx => {
    const plan = await tx.curriculumLessonPlan.findFirst({ where: { id: req.params.lessonPlanId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!plan) return { notFound: true };
    if (["COMPLETED", "ARCHIVED"].includes(plan.status)) return { locked: true };
    if (staffIds.length) {
      const designations = await tx.staffDesignation.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, isActive: true, isTeachingRole: true }, select: { id: true } });
      const staff = await tx.staffMember.findMany({ where: { id: { in: staffIds }, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE", designationId: { in: designations.map((d: any) => d.id) } }, select: { id: true } });
      if (staff.length !== staffIds.length) return { invalidStaff: true };
    }
    await tx.curriculumLessonPlanTeacherAssignment.deleteMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: plan.id } });
    if (staffIds.length) await tx.curriculumLessonPlanTeacherAssignment.createMany({ data: staffIds.map((staffMemberId: string) => ({ organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: plan.id, staffMemberId, isPrimary: staffMemberId === primaryStaffId, assignedBy: s.userId })) });
    return { updated: true };
  });
  if ((result as any).notFound) return res.status(404).json({ error: "Lesson plan not found" });
  if ((result as any).locked) return res.status(409).json({ error: "Completed or archived plans cannot have teacher assignments changed" });
  if ((result as any).invalidStaff) return res.status(400).json({ error: "Teachers must be active teaching staff members in this school" });
  return res.json({ data: result });
}));

// P421 teacher-facing lesson workspace: assigned lessons only, scoped to the signed-in staff member.
curriculumRouter.get("/:organizationId/:schoolId/teacher-lesson-plans", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.read"); if (!s) return;
  const data = await withTenantContext(prisma, s, async tx => {
    const staff = await tx.staffMember.findFirst({ where: { userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } });
    if (!staff) return { staffMissing: true };
    const assignments = await tx.curriculumLessonPlanTeacherAssignment.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, staffMemberId: staff.id }, select: { lessonPlanId: true, isPrimary: true } });
    if (!assignments.length) return [];
    const planIds = assignments.map((a: any) => a.lessonPlanId);
    const plans = await tx.curriculumLessonPlan.findMany({ where: { id: { in: planIds }, organizationId: s.organizationId, schoolId: s.schoolId }, orderBy: [{ plannedDate: "asc" }, { createdAt: "desc" }] });
    const reflections = await tx.curriculumLessonPlanReflection.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: { in: planIds }, staffMemberId: staff.id }, orderBy: [{ reflectedAt: "desc" }, { updatedAt: "desc" }] });
    const reflectionHistoryByPlan = new Map<string, any[]>(); for (const reflection of reflections) { const list = reflectionHistoryByPlan.get(reflection.lessonPlanId) || []; list.push(reflection); reflectionHistoryByPlan.set(reflection.lessonPlanId, list); }
    const assignmentByPlan = new Map(assignments.map((a: any) => [a.lessonPlanId, a]));
    const outcomeLinks = await tx.curriculumLessonPlanOutcome.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: { in: planIds } } });
    const outcomeIds = [...new Set(outcomeLinks.map((l: any) => l.outcomeId))];
    const outcomes = outcomeIds.length ? await tx.curriculumOutcome.findMany({ where: { id: { in: outcomeIds }, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true, code: true, title: true, description: true } }) : [];
    const outcomeMap = new Map(outcomes.map((o: any) => [o.id, o]));
    const linksByPlan = new Map<string, any[]>();
    for (const link of outcomeLinks) { const list = linksByPlan.get(link.lessonPlanId) || []; const outcome = outcomeMap.get(link.outcomeId); if (outcome) list.push(outcome); linksByPlan.set(link.lessonPlanId, list); }
    return plans.map((plan: any) => ({ ...plan, isPrimaryTeacher: !!assignmentByPlan.get(plan.id)?.isPrimary, outcomes: linksByPlan.get(plan.id) || [], reflection: reflectionHistoryByPlan.get(plan.id)?.[0] || null, reflectionHistory: reflectionHistoryByPlan.get(plan.id) || [] }));
  });
  if ((data as any).staffMissing) return res.status(403).json({ error: "Active staff profile required for teacher workspace" });
  return res.json({ data });
}));

curriculumRouter.patch("/:organizationId/:schoolId/teacher-lesson-plans/:lessonPlanId/status", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.read"); if (!s) return;
  const requested = String(req.body?.status || "");
  if (!["PLANNED", "COMPLETED"].includes(requested)) return res.status(400).json({ error: "Teacher status must be PLANNED or COMPLETED" });
  const result = await withTenantContext(prisma, s, async tx => {
    const staff = await tx.staffMember.findFirst({ where: { userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } });
    if (!staff) return { staffMissing: true };
    const assignment = await tx.curriculumLessonPlanTeacherAssignment.findFirst({ where: { organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: req.params.lessonPlanId, staffMemberId: staff.id } });
    if (!assignment) return { forbidden: true };
    const plan = await tx.curriculumLessonPlan.findFirst({ where: { id: req.params.lessonPlanId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!plan) return { notFound: true };
    if (plan.status === "ARCHIVED" || plan.status === "COMPLETED") return { locked: true };
    if (requested === "COMPLETED" && plan.status !== "PLANNED") return { invalidTransition: true };
    return tx.curriculumLessonPlan.update({ where: { id: plan.id }, data: { status: requested } });
  });
  if ((result as any).staffMissing) return res.status(403).json({ error: "Active staff profile required" });
  if ((result as any).forbidden) return res.status(403).json({ error: "Only assigned teachers can update this lesson" });
  if ((result as any).notFound) return res.status(404).json({ error: "Lesson plan not found" });
  if ((result as any).locked) return res.status(409).json({ error: "Completed or archived lessons cannot be changed" });
  if ((result as any).invalidTransition) return res.status(409).json({ error: "Lesson must be PLANNED before it can be marked COMPLETED" });
  return res.json({ data: result });
}));


// P422 teacher reflection: assigned teacher can save reflections only after lesson completion.
curriculumRouter.put("/:organizationId/:schoolId/teacher-lesson-plans/:lessonPlanId/reflection", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.read"); if (!s) return;
  const textFields = ["teachingNotes", "challenges", "followUpActions"] as const;
  const values: Record<string, string | null> = {};
  for (const field of textFields) { const value = req.body?.[field]; if (value !== undefined && value !== null && typeof value !== "string") return res.status(400).json({ error: `${field} must be text` }); const normalized = typeof value === "string" ? value.trim() : ""; const limit = field === "teachingNotes" ? 5000 : 3000; if (normalized.length > limit) return res.status(400).json({ error: `${field} exceeds ${limit} characters` }); values[field] = normalized || null; }
  const duration = req.body?.actualDurationMinutes; if (duration !== undefined && duration !== null && (!Number.isInteger(duration) || duration < 1 || duration > 600)) return res.status(400).json({ error: "actualDurationMinutes must be an integer from 1 to 600" });
  const result = await withTenantContext(prisma, s, async tx => {
    const staff = await tx.staffMember.findFirst({ where: { userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } }); if (!staff) return { staffMissing: true };
    const assignment = await tx.curriculumLessonPlanTeacherAssignment.findFirst({ where: { organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: req.params.lessonPlanId, staffMemberId: staff.id } }); if (!assignment) return { forbidden: true };
    const plan = await tx.curriculumLessonPlan.findFirst({ where: { id: req.params.lessonPlanId, organizationId: s.organizationId, schoolId: s.schoolId } }); if (!plan) return { notFound: true }; if (plan.status !== "COMPLETED") return { notCompleted: true };
    return tx.curriculumLessonPlanReflection.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, lessonPlanId: plan.id, staffMemberId: staff.id, teachingNotes: values.teachingNotes, challenges: values.challenges, followUpActions: values.followUpActions, actualDurationMinutes: duration ?? null } });
  });
  if ((result as any).staffMissing) return res.status(403).json({ error: "Active staff profile required" }); if ((result as any).forbidden) return res.status(403).json({ error: "Only assigned teachers can save reflections" }); if ((result as any).notFound) return res.status(404).json({ error: "Lesson plan not found" }); if ((result as any).notCompleted) return res.status(409).json({ error: "Reflection is available after the lesson is marked completed" }); return res.json({ data: result });
}));


// P424 coordinator-created follow-up tasks and teacher-owned task updates.
curriculumRouter.get("/:organizationId/:schoolId/lesson-reflection-tasks", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return; const status = String(req.query.status || "ALL"); if (status !== "ALL" && !["PENDING","IN_PROGRESS","COMPLETED"].includes(status)) return res.status(400).json({ error: "Invalid task status filter" });
  const dueBucket = String(req.query.dueBucket || "ALL"); if (!["ALL","OVERDUE","DUE_TODAY","UPCOMING","NO_DUE_DATE"].includes(dueBucket)) return res.status(400).json({ error: "Invalid dueBucket filter" });
  const now = new Date(); const todayStart = new Date(now); todayStart.setUTCHours(0,0,0,0); const tomorrow = new Date(todayStart); tomorrow.setUTCDate(tomorrow.getUTCDate()+1);
  const dueFilter = dueBucket === "OVERDUE" ? { dueAt: { lt: todayStart }, status: { not: "COMPLETED" } } : dueBucket === "DUE_TODAY" ? { dueAt: { gte: todayStart, lt: tomorrow }, status: { not: "COMPLETED" } } : dueBucket === "UPCOMING" ? { dueAt: { gte: tomorrow }, status: { not: "COMPLETED" } } : dueBucket === "NO_DUE_DATE" ? { dueAt: null } : {};
  const data = await withTenantContext(prisma, s, async tx => tx.curriculumLessonReflectionTask.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, ...(status === "ALL" ? {} : { status }), ...dueFilter }, orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }], take: 500 })); return res.json({ data });
}));

curriculumRouter.post("/:organizationId/:schoolId/lesson-reflection-tasks", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return; const { reflectionId, title, description, priority, dueAt } = req.body || {}; if (typeof reflectionId !== "string" || !reflectionId.trim()) return res.status(400).json({ error: "reflectionId is required" }); if (typeof title !== "string" || !title.trim() || title.trim().length > 240) return res.status(400).json({ error: "title is required (max 240 characters)" }); if (description != null && (typeof description !== "string" || description.length > 3000)) return res.status(400).json({ error: "description must be text up to 3000 characters" }); if (priority !== undefined && !["LOW","MEDIUM","HIGH"].includes(priority)) return res.status(400).json({ error: "priority must be LOW, MEDIUM, or HIGH" }); if (dueAt !== undefined && dueAt !== null && (typeof dueAt !== "string" || !Number.isFinite(Date.parse(dueAt)))) return res.status(400).json({ error: "dueAt must be a valid date" });
  const result = await withTenantContext(prisma, s, async tx => { const reflection = await tx.curriculumLessonPlanReflection.findFirst({ where: { id: reflectionId, organizationId: s.organizationId, schoolId: s.schoolId } }); if (!reflection) return { notFound: true }; const staff = await tx.staffMember.findFirst({ where: { id: reflection.staffMemberId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } }); if (!staff) return { staffMissing: true }; const plan = await tx.curriculumLessonPlan.findFirst({ where: { id: reflection.lessonPlanId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } }); if (!plan) return { notFound: true }; return tx.curriculumLessonReflectionTask.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, reflectionId: reflection.id, lessonPlanId: plan.id, assignedToStaffMemberId: staff.id, createdByUserId: s.userId, title: title.trim(), description: description?.trim() || null, priority: priority || "MEDIUM", dueAt: dueAt ? new Date(dueAt) : null } }); }); if ((result as any).notFound) return res.status(404).json({ error: "Reflection or lesson plan not found" }); if ((result as any).staffMissing) return res.status(409).json({ error: "Assigned staff profile is inactive or missing" });
  await withTenantContext(prisma, s, async tx => { const recipient = await tx.staffMember.findFirst({ where: { id: result.assignedToStaffMemberId, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true } }); if (!recipient) return; await tx.curriculumLessonReflectionTaskNotification.createMany({ data: [{ organizationId: s.organizationId, schoolId: s.schoolId, recipientStaffMemberId: recipient.id, taskId: result.id, notificationType: "ASSIGNED", title: "New follow-up task assigned", body: result.title, dedupeKey: `${s.organizationId}:${s.schoolId}:${result.id}:ASSIGNED` }], skipDuplicates: true }); }); return res.status(201).json({ data: result });
}));

curriculumRouter.patch("/:organizationId/:schoolId/lesson-reflection-tasks/:taskId", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return; const { status, priority, dueAt } = req.body || {}; if (status !== undefined && !["PENDING","IN_PROGRESS","COMPLETED"].includes(status)) return res.status(400).json({ error: "Invalid task status" }); if (priority !== undefined && !["LOW","MEDIUM","HIGH"].includes(priority)) return res.status(400).json({ error: "Invalid priority" }); if (dueAt !== undefined && dueAt !== null && (typeof dueAt !== "string" || !Number.isFinite(Date.parse(dueAt)))) return res.status(400).json({ error: "Invalid dueAt" }); if (status === undefined && priority === undefined && dueAt === undefined) return res.status(400).json({ error: "No task update provided" }); const result = await withTenantContext(prisma, s, async tx => { const task = await tx.curriculumLessonReflectionTask.findFirst({ where: { id: req.params.taskId, organizationId: s.organizationId, schoolId: s.schoolId } }); if (!task) return null; return tx.curriculumLessonReflectionTask.update({ where: { id: task.id }, data: { ...(status === undefined ? {} : { status, ...(status === "COMPLETED" ? { completedAt: new Date() } : {}) }), ...(priority === undefined ? {} : { priority }), ...(dueAt === undefined ? {} : { dueAt: dueAt ? new Date(dueAt) : null }) } }); }); if (!result) return res.status(404).json({ error: "Task not found" }); return res.json({ data: result });
}));

curriculumRouter.get("/:organizationId/:schoolId/teacher-lesson-reflection-tasks", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.read"); if (!s) return; const data = await withTenantContext(prisma, s, async tx => { const staff = await tx.staffMember.findFirst({ where: { userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } }); if (!staff) return { staffMissing: true }; return tx.curriculumLessonReflectionTask.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, assignedToStaffMemberId: staff.id }, orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }], take: 300 }); }); if ((data as any).staffMissing) return res.status(403).json({ error: "Active staff profile required" }); return res.json({ data });
}));

curriculumRouter.patch("/:organizationId/:schoolId/teacher-lesson-reflection-tasks/:taskId", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.read"); if (!s) return; const status = req.body?.status; const completionNotes = req.body?.completionNotes; if (status !== undefined && !["IN_PROGRESS","COMPLETED"].includes(status)) return res.status(400).json({ error: "Task status must be IN_PROGRESS or COMPLETED" }); if (completionNotes !== undefined && completionNotes !== null && (typeof completionNotes !== "string" || completionNotes.length > 3000)) return res.status(400).json({ error: "completionNotes must be text up to 3000 characters" }); if (status === undefined && completionNotes === undefined) return res.status(400).json({ error: "No task update supplied" }); const result = await withTenantContext(prisma, s, async tx => { const staff = await tx.staffMember.findFirst({ where: { userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } }); if (!staff) return { staffMissing: true }; const task = await tx.curriculumLessonReflectionTask.findFirst({ where: { id: req.params.taskId, organizationId: s.organizationId, schoolId: s.schoolId, assignedToStaffMemberId: staff.id } }); if (!task) return { forbidden: true }; if (task.status === "COMPLETED" && status && status !== "COMPLETED") return { locked: true }; return tx.curriculumLessonReflectionTask.update({ where: { id: task.id }, data: { ...(status === undefined ? {} : { status }), ...(completionNotes === undefined ? {} : { completionNotes: completionNotes?.trim() || null }), ...(status === "COMPLETED" ? { completedAt: new Date() } : {}) } }); }); if ((result as any).staffMissing) return res.status(403).json({ error: "Active staff profile required" }); if ((result as any).forbidden) return res.status(403).json({ error: "Only the assigned teacher can update this task" }); if ((result as any).locked) return res.status(409).json({ error: "Completed task cannot be reopened" }); return res.json({ data: result });
}));

// P423 academic coordinator reflection review and follow-up management.
// P426 in-app notification inbox for assigned teachers; tenant and staff scoped.
curriculumRouter.get("/:organizationId/:schoolId/teacher-task-notifications", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.read"); if (!s) return;
  const data = await withTenantContext(prisma, s, async tx => { const staff = await tx.staffMember.findFirst({ where: { userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } }); if (!staff) return { staffMissing: true }; return tx.curriculumLessonReflectionTaskNotification.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, recipientStaffMemberId: staff.id }, orderBy: [{ createdAt: "desc" }], take: 100 }); });
  if ((data as any).staffMissing) return res.status(403).json({ error: "Active staff profile required" }); return res.json({ data });
}));

curriculumRouter.patch("/:organizationId/:schoolId/teacher-task-notifications/:notificationId/read", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.read"); if (!s) return;
  const result = await withTenantContext(prisma, s, async tx => { const staff = await tx.staffMember.findFirst({ where: { userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } }); if (!staff) return { staffMissing: true }; const n = await tx.curriculumLessonReflectionTaskNotification.findFirst({ where: { id: req.params.notificationId, organizationId: s.organizationId, schoolId: s.schoolId, recipientStaffMemberId: staff.id } }); if (!n) return null; return tx.curriculumLessonReflectionTaskNotification.update({ where: { id: n.id }, data: { readAt: n.readAt || new Date() } }); });
  if ((result as any).staffMissing) return res.status(403).json({ error: "Active staff profile required" }); if (!result) return res.status(404).json({ error: "Notification not found" }); return res.json({ data: result });
}));

// Coordinator-triggered, deduplicated reminder generation for due-soon and overdue tasks.
curriculumRouter.post("/:organizationId/:schoolId/lesson-reflection-task-notifications/generate", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return; const now = new Date(); const soon = new Date(now.getTime()+24*60*60*1000); const dayKey = now.toISOString().slice(0,10);
  const result = await withTenantContext(prisma, s, async tx => { const tasks = await tx.curriculumLessonReflectionTask.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, status: { not: "COMPLETED" }, dueAt: { not: null, lte: soon } }, select: { id: true, title: true, dueAt: true, assignedToStaffMemberId: true, status: true } }); let created = 0; for (const task of tasks) { const overdue = !!task.dueAt && task.dueAt < now; const type = overdue ? "OVERDUE" : "DUE_SOON"; const key = `${s.organizationId}:${s.schoolId}:${task.id}:${type}:${dayKey}`; const title = overdue ? "Follow-up task overdue" : "Follow-up task due soon"; const body = overdue ? `${task.title} is overdue. Please review and update it.` : `${task.title} is due within the next 24 hours.`; const inserted = await tx.curriculumLessonReflectionTaskNotification.createMany({ data: [{ organizationId: s.organizationId, schoolId: s.schoolId, recipientStaffMemberId: task.assignedToStaffMemberId, taskId: task.id, notificationType: type, title, body, dedupeKey: key }], skipDuplicates: true }); created += inserted.count; } return { scanned: tasks.length, created }; }); return res.json({ data: result });
}));

curriculumRouter.get("/:organizationId/:schoolId/lesson-reflection-reviews", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const followUpStatus = String(req.query.followUpStatus || "ALL"); const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED"]; if (followUpStatus !== "ALL" && !statuses.includes(followUpStatus)) return res.status(400).json({ error: "Invalid follow-up status filter" });
  const staffMemberId = String(req.query.staffMemberId || ""); const gradeLevelId = String(req.query.gradeLevelId || ""); const curriculumSubjectId = String(req.query.curriculumSubjectId || ""); const fromDate = String(req.query.fromDate || ""); const toDate = String(req.query.toDate || "");
  if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) return res.status(400).json({ error: "fromDate must use YYYY-MM-DD" }); if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) return res.status(400).json({ error: "toDate must use YYYY-MM-DD" });
  const data = await withTenantContext(prisma, s, async tx => {
    const reflectedAtFilter = fromDate || toDate ? { reflectedAt: { ...(fromDate ? { gte: new Date(`${fromDate}T00:00:00.000Z`) } : {}), ...(toDate ? { lte: new Date(`${toDate}T23:59:59.999Z`) } : {}) } } : {};
    const rows = await tx.curriculumLessonPlanReflection.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, ...(followUpStatus === "ALL" ? {} : { followUpStatus }), ...(staffMemberId ? { staffMemberId } : {}), ...reflectedAtFilter }, orderBy: [{ reflectedAt: "desc" }], take: 500 });
    const planIds = [...new Set(rows.map((r: any) => r.lessonPlanId))]; const plans = planIds.length ? await tx.curriculumLessonPlan.findMany({ where: { id: { in: planIds }, organizationId: s.organizationId, schoolId: s.schoolId, ...(gradeLevelId ? { gradeLevelId } : {}), ...(curriculumSubjectId ? { curriculumSubjectId } : {}) }, select: { id: true, title: true, plannedDate: true, durationMinutes: true, gradeLevelId: true, curriculumSubjectId: true, status: true } }) : []; const planMap = new Map(plans.map((p: any) => [p.id, p]));
    const staffIds = [...new Set(rows.filter((r: any) => planMap.has(r.lessonPlanId)).map((r: any) => r.staffMemberId))]; const staffRows = staffIds.length ? await tx.staffMember.findMany({ where: { id: { in: staffIds }, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true, firstName: true, lastName: true, preferredName: true, employeeNumber: true } }) : []; const staffMap = new Map(staffRows.map((st: any) => [st.id, st]));
    return rows.filter((r: any) => planMap.has(r.lessonPlanId)).map((r: any) => ({ ...r, lessonPlan: planMap.get(r.lessonPlanId), teacher: staffMap.get(r.staffMemberId) || null }));
  }); return res.json({ data });
}));

curriculumRouter.patch("/:organizationId/:schoolId/lesson-reflection-reviews/:reflectionId", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return; const followUpStatus = req.body?.followUpStatus; const coordinatorNotes = req.body?.coordinatorNotes; if (followUpStatus !== undefined && !["PENDING","IN_PROGRESS","COMPLETED"].includes(followUpStatus)) return res.status(400).json({ error: "followUpStatus must be PENDING, IN_PROGRESS, or COMPLETED" }); if (coordinatorNotes !== undefined && coordinatorNotes !== null && (typeof coordinatorNotes !== "string" || coordinatorNotes.trim().length > 3000)) return res.status(400).json({ error: "coordinatorNotes must be text up to 3000 characters" }); if (followUpStatus === undefined && coordinatorNotes === undefined) return res.status(400).json({ error: "No review fields provided" });
  const result = await withTenantContext(prisma, s, async tx => { const existing = await tx.curriculumLessonPlanReflection.findFirst({ where: { id: req.params.reflectionId, organizationId: s.organizationId, schoolId: s.schoolId } }); if (!existing) return null; return tx.curriculumLessonPlanReflection.update({ where: { id: existing.id }, data: { ...(followUpStatus === undefined ? {} : { followUpStatus }), ...(coordinatorNotes === undefined ? {} : { coordinatorNotes: coordinatorNotes?.trim() || null }), reviewedAt: new Date(), reviewedBy: s.userId } }); }); if (!result) return res.status(404).json({ error: "Reflection not found" }); return res.json({ data: result });
}));

curriculumRouter.delete("/:organizationId/:schoolId/lesson-plans/:lessonPlanId", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return; if (!await entitlement(s.organizationId, s.schoolId)) return res.status(402).json({ error: "Curriculum configuration is not included in the active subscription" });
  const result = await withTenantContext(prisma, s, async tx => { const plan = await tx.curriculumLessonPlan.findFirst({ where: { id: req.params.lessonPlanId, organizationId: s.organizationId, schoolId: s.schoolId } }); if (!plan) return { notFound: true }; if (plan.status !== "DRAFT") return { locked: true }; return tx.curriculumLessonPlan.delete({ where: { id: plan.id } }); });
  if ((result as any).notFound) return res.status(404).json({ error: "Lesson plan not found" }); if ((result as any).locked) return res.status(409).json({ error: "Only draft lesson plans can be deleted; planned or completed plans must be retained" }); return res.json({ data: { deleted: true } });
}));


curriculumRouter.post("/:organizationId/:schoolId/versions/:versionId/subjects", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await admin(s, res))) return;
  const parsed = curriculumSubjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid curriculum subject", details: parsed.error.flatten() });
  const data = await withTenantContext(prisma, s, async tx => {
    const version = await tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } });
    const grade = await tx.gradeLevel.findFirst({ where: { id: parsed.data.gradeLevelId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!version || !grade) return null;
    return tx.curriculumSubject.create({
      data: { ...parsed.data, organizationId: s.organizationId, schoolId: s.schoolId,
        curriculumVersionId: version.id, maxMarks: parsed.data.maxMarks, passMarks: parsed.data.passMarks }
    });
  });
  if (!data) return res.status(404).json({ error: "Curriculum version or grade level not found in this school" });
  return res.status(201).json({ data });
}));

curriculumRouter.get("/:organizationId/:schoolId/versions/:versionId/subjects", asyncRoute(async (req, res) => {
  const s = await scope(req, res); if (!s) return;
  const data = await withTenantContext(prisma, s, async tx => {
    const version = await tx.curriculumVersion.findFirst({ where: { id: req.params.versionId, organizationId: s.organizationId, schoolId: s.schoolId } });
    if (!version) return null;
    return tx.curriculumSubject.findMany({
      where: { curriculumVersionId: version.id, organizationId: s.organizationId, schoolId: s.schoolId },
      orderBy: [{ gradeLevelId: "asc" }, { sequence: "asc" }, { name: "asc" }]
    });
  });
  if (!data) return res.status(404).json({ error: "Curriculum version not found" });
  return res.json({ data });
}));

// P428: teacher reminder preferences and coordinator school defaults.
const TEACHER_TASK_DUE_SOON_CATEGORY = "TEACHER_TASK_DUE_SOON";
const TEACHER_TASK_OVERDUE_CATEGORY = "TEACHER_TASK_OVERDUE";
curriculumRouter.get("/:organizationId/:schoolId/teacher-task-reminder-preferences", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.read"); if (!s) return;
  const data = await withTenantContext(prisma, s, async tx => {
    const staff = await tx.staffMember.findFirst({ where: { userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } });
    if (!staff) return { staffMissing: true };
    const prefs = await tx.notificationPreference.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, userId: s.userId, channel: "IN_APP", category: { in: [TEACHER_TASK_DUE_SOON_CATEGORY, TEACHER_TASK_OVERDUE_CATEGORY] } } });
    return { dueSoonEnabled: prefs.find(p => p.category === TEACHER_TASK_DUE_SOON_CATEGORY)?.enabled ?? true, overdueEnabled: prefs.find(p => p.category === TEACHER_TASK_OVERDUE_CATEGORY)?.enabled ?? true };
  });
  if ((data as any).staffMissing) return res.status(403).json({ error: "Active staff profile required" }); return res.json({ data });
}));
curriculumRouter.patch("/:organizationId/:schoolId/teacher-task-reminder-preferences", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.read"); if (!s) return; const { dueSoonEnabled, overdueEnabled } = req.body || {};
  if (typeof dueSoonEnabled !== "boolean" && typeof overdueEnabled !== "boolean") return res.status(400).json({ error: "At least one preference boolean is required" });
  const result = await withTenantContext(prisma, s, async tx => {
    const staff = await tx.staffMember.findFirst({ where: { userId: s.userId, organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE" }, select: { id: true } }); if (!staff) return { staffMissing: true };
    const updates = [] as any[];
    for (const [category, enabled] of [[TEACHER_TASK_DUE_SOON_CATEGORY, dueSoonEnabled], [TEACHER_TASK_OVERDUE_CATEGORY, overdueEnabled]] as const) { if (typeof enabled !== "boolean") continue; updates.push(await tx.notificationPreference.upsert({ where: { organizationId_schoolId_userId_category_channel: { organizationId: s.organizationId, schoolId: s.schoolId, userId: s.userId, category, channel: "IN_APP" } }, create: { organizationId: s.organizationId, schoolId: s.schoolId, userId: s.userId, category, channel: "IN_APP", enabled }, update: { enabled } })); }
    return { dueSoonEnabled, overdueEnabled };
  });
  if ((result as any).staffMissing) return res.status(403).json({ error: "Active staff profile required" }); return res.json({ data: result });
}));
// P430: coordinator-safe aggregate teacher reminder preference insight (no individual identities).
curriculumRouter.get("/:organizationId/:schoolId/teacher-task-reminder-preference-summary", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const summary = await withTenantContext(prisma, s, async tx => {
    // P431: Restrict cohort to active teaching-role designations, not all staff.
    const teachingDesignations = await tx.staffDesignation.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, isActive: true, isTeachingRole: true }, select: { id: true } });
    const designationIds = teachingDesignations.map(d => d.id);
    if (!designationIds.length) return { suppressed: true, minimumCohortSize: 5, reason: "COHORT_BELOW_PRIVACY_THRESHOLD" };
    const staff = await tx.staffMember.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, status: "ACTIVE", userId: { not: null }, designationId: { in: designationIds } }, select: { userId: true } });
    const teacherIds = new Set(staff.map(x => x.userId).filter(Boolean));
    // Suppress all metrics for cohorts below 5 to reduce re-identification risk.
    if (teacherIds.size < 5) return { suppressed: true, minimumCohortSize: 5, reason: "COHORT_BELOW_PRIVACY_THRESHOLD" };
    const prefs = await tx.notificationPreference.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, channel: "IN_APP", category: { in: [TEACHER_TASK_DUE_SOON_CATEGORY, TEACHER_TASK_OVERDUE_CATEGORY] }, userId: { in: [...teacherIds] } }, select: { userId: true, category: true, enabled: true } });
    const categories = [TEACHER_TASK_DUE_SOON_CATEGORY, TEACHER_TASK_OVERDUE_CATEGORY].map(category => {
      const rows = prefs.filter(p => p.category === category); const byUser = new Map(rows.map(p => [p.userId, p.enabled]));
      const optedIn = [...byUser.values()].filter(Boolean).length; const optedOut = [...byUser.values()].filter(v => !v).length;
      return { category, staffCount: teacherIds.size, explicitPreferenceCount: byUser.size, enabledOverrideCount: optedIn, disabledOverrideCount: optedOut, noExplicitPreferenceCount: Math.max(0, teacherIds.size - byUser.size) };
    });
    return { suppressed: false, staffCount: teacherIds.size, categories };
  });
  return res.json({ data: summary });
}));
curriculumRouter.get("/:organizationId/:schoolId/lesson-reflection-task-reminder-defaults", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return; const data = await withTenantContext(prisma, s, async tx => tx.teacherTaskReminderPolicy.findUnique({ where: { organizationId_schoolId: { organizationId: s.organizationId, schoolId: s.schoolId } } })); return res.json({ data: data || { dueSoonEnabled: true, overdueEnabled: true, overdueFrequencyHours: 24 } });
}));
curriculumRouter.patch("/:organizationId/:schoolId/lesson-reflection-task-reminder-defaults", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return; const { dueSoonEnabled, overdueEnabled, overdueFrequencyHours } = req.body || {};
  if ((dueSoonEnabled !== undefined && typeof dueSoonEnabled !== "boolean") || (overdueEnabled !== undefined && typeof overdueEnabled !== "boolean") || (overdueFrequencyHours !== undefined && (!Number.isInteger(overdueFrequencyHours) || overdueFrequencyHours < 12 || overdueFrequencyHours > 168))) return res.status(400).json({ error: "Invalid reminder defaults; frequency must be 12–168 hours" });
  if (dueSoonEnabled === undefined && overdueEnabled === undefined && overdueFrequencyHours === undefined) return res.status(400).json({ error: "No reminder defaults supplied" });
  const data = await withTenantContext(prisma, s, async tx => {
    const existing = await tx.teacherTaskReminderPolicy.findUnique({ where: { organizationId_schoolId: { organizationId: s.organizationId, schoolId: s.schoolId } } });
    const before = { dueSoonEnabled: existing?.dueSoonEnabled ?? true, overdueEnabled: existing?.overdueEnabled ?? true, overdueFrequencyHours: existing?.overdueFrequencyHours ?? 24 };
    const next = { dueSoonEnabled: dueSoonEnabled ?? before.dueSoonEnabled, overdueEnabled: overdueEnabled ?? before.overdueEnabled, overdueFrequencyHours: overdueFrequencyHours ?? before.overdueFrequencyHours };
    const saved = await tx.teacherTaskReminderPolicy.upsert({ where: { organizationId_schoolId: { organizationId: s.organizationId, schoolId: s.schoolId } }, create: { organizationId: s.organizationId, schoolId: s.schoolId, ...next, updatedByUserId: s.userId }, update: { ...next, updatedByUserId: s.userId } });
    const action = req.body?.auditAction === "RESET" ? "RESET" : existing ? "UPDATE" : "CREATE";
    await tx.teacherTaskReminderPolicyAudit.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, actorUserId: s.userId, action, previousValues: before, newValues: next } });
    return saved;
  }); return res.json({ data });
}));

// P434: asynchronous reminder policy audit export jobs (large exports).
function reminderAuditCsv(rows: any[]) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return ["createdAt,actorUserId,action,previousValues,newValues", ...rows.map(r => [r.createdAt.toISOString(), r.actorUserId, r.action, JSON.stringify(r.previousValues), JSON.stringify(r.newValues)].map(esc).join(","))].join("\n");
}
// P437: bounded school/requester queue capacity and duplicate active-request protection.
curriculumRouter.post("/:organizationId/:schoolId/lesson-reflection-task-reminder-policy-export-jobs", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const { action, actor, after, before } = req.body || {};
  if (action && !["CREATE", "UPDATE", "RESET"].includes(String(action).toUpperCase())) return res.status(400).json({ error: "Invalid action filter" });
  const from = after ? new Date(after) : undefined; const to = before ? new Date(before) : undefined;
  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime())) || (from && to && from > to)) return res.status(400).json({ error: "Invalid date range" });
  const filters = { action: action ? String(action).toUpperCase() : null, actor: actor ? String(actor).trim().slice(0, 128) : null, after: from?.toISOString() ?? null, before: to?.toISOString() ?? null };
  // P437: capacity protection and active duplicate request suppression.
  const SCHOOL_QUEUE_CAP = Math.max(1, Math.min(500, Number(process.env.REMINDER_AUDIT_EXPORT_SCHOOL_QUEUE_CAP) || 25));
  const REQUESTER_QUEUE_CAP = Math.max(1, Math.min(100, Number(process.env.REMINDER_AUDIT_EXPORT_REQUESTER_QUEUE_CAP) || 5));
  const result = await withTenantContext(prisma, s, async tx => {
    const activeWhere = { organizationId: s.organizationId, schoolId: s.schoolId, status: { in: ["QUEUED", "PROCESSING"] } };
    const requesterWhere = { ...activeWhere, requestedByUserId: s.userId };
    const [schoolActive, requesterActive, duplicate] = await Promise.all([
      tx.teacherTaskReminderPolicyExportJob.count({ where: activeWhere }),
      tx.teacherTaskReminderPolicyExportJob.count({ where: requesterWhere }),
      tx.teacherTaskReminderPolicyExportJob.findFirst({ where: { ...requesterWhere, status: "QUEUED", filters } , select: { id: true, createdAt: true } })
    ]);
    if (duplicate) return { kind: "duplicate" as const, duplicate };
    if (schoolActive >= SCHOOL_QUEUE_CAP || requesterActive >= REQUESTER_QUEUE_CAP) return { kind: "capacity" as const, schoolActive, requesterActive, schoolCap: SCHOOL_QUEUE_CAP, requesterCap: REQUESTER_QUEUE_CAP };
    const job = await tx.teacherTaskReminderPolicyExportJob.create({ data: { organizationId: s.organizationId, schoolId: s.schoolId, requestedByUserId: s.userId, filters } });
    return { kind: "created" as const, job };
  });
  if (result.kind === "duplicate") return res.status(409).json({ error: "An identical reminder audit export is already queued", data: { duplicateJobId: result.duplicate.id, createdAt: result.duplicate.createdAt } });
  if (result.kind === "capacity") return res.status(429).setHeader("Retry-After", "60").json({ error: "Reminder audit export queue is at capacity", data: { schoolActive: result.schoolActive, requesterActive: result.requesterActive, schoolCap: result.schoolCap, requesterCap: result.requesterCap, retryAfterSeconds: 60 } });
  const job = result.job;
  return res.status(202).json({ data: { id: job.id, status: job.status, createdAt: job.createdAt, statusUrl: `/api/v1/curriculum/${s.organizationId}/${s.schoolId}/lesson-reflection-task-reminder-policy-export-jobs/${job.id}` } });
}));
// P436: school-scoped operational observability for reminder audit export jobs.
curriculumRouter.get("/:organizationId/:schoolId/lesson-reflection-task-reminder-policy-export-health", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const now = new Date();
  const scoped = { organizationId: s.organizationId, schoolId: s.schoolId };
  const [groups, queuedOldest, recentCompleted, recentFailures, processing] = await withTenantContext(prisma, s, async tx => Promise.all([
    tx.teacherTaskReminderPolicyExportJob.groupBy({ by: ["status"], where: scoped, _count: { _all: true } }),
    tx.teacherTaskReminderPolicyExportJob.findFirst({ where: { ...scoped, status: "QUEUED" }, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    tx.teacherTaskReminderPolicyExportJob.findMany({ where: { ...scoped, status: "COMPLETED", startedAt: { not: null }, completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 200, select: { startedAt: true, completedAt: true, rowCount: true } }),
    tx.teacherTaskReminderPolicyExportJob.findMany({ where: { ...scoped, status: "FAILED", completedAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }, orderBy: { completedAt: "desc" }, take: 100, select: { errorCode: true } }),
    tx.teacherTaskReminderPolicyExportJob.findMany({ where: { ...scoped, status: "PROCESSING" }, orderBy: { startedAt: "asc" }, take: 100, select: { startedAt: true, attemptCount: true } })
  ]));
  const workerHeartbeat = await prisma.$queryRawUnsafe<Array<{status:string;lastHeartbeatAt:Date;lastSuccessAt:Date|null;lastErrorAt:Date|null;lastErrorCode:string|null;consecutiveFailures:number}>>(
    'SELECT "status","lastHeartbeatAt","lastSuccessAt","lastErrorAt","lastErrorCode","consecutiveFailures" FROM "BackgroundWorkerHeartbeat" WHERE "workerName"=$1 LIMIT 1',
    "reminder-policy-audit-export-worker"
  ).catch(() => []);
  const worker = workerHeartbeat[0] ?? null;
  const workerHeartbeatAgeMs = worker ? Math.max(0, now.getTime() - worker.lastHeartbeatAt.getTime()) : null;
  const workerHealth = !worker ? "UNKNOWN" : workerHeartbeatAgeMs! > 90_000 ? "STALE" : worker.status;
  const statusCounts = Object.fromEntries(groups.map(g => [g.status, g._count._all]));
  const durations = recentCompleted.map(j => Math.max(0, j.completedAt!.getTime() - j.startedAt!.getTime()));
  const avgDurationMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
  const failureCounts = Object.fromEntries([...new Set(recentFailures.map(f => f.errorCode || "UNKNOWN"))].map(code => [code, recentFailures.filter(f => (f.errorCode || "UNKNOWN") === code).length]));
  return res.json({ data: { sampledAt: now.toISOString(), statusCounts, queued: statusCounts.QUEUED || 0, processing: statusCounts.PROCESSING || 0, completed: statusCounts.COMPLETED || 0, failed: statusCounts.FAILED || 0, expired: statusCounts.EXPIRED || 0, oldestQueuedAt: queuedOldest?.createdAt ?? null, oldestQueuedAgeMs: queuedOldest ? Math.max(0, now.getTime() - queuedOldest.createdAt.getTime()) : null, activeProcessingCount: processing.length, maxActiveAttemptCount: processing.reduce((max, j) => Math.max(max, j.attemptCount), 0), averageProcessingDurationMs: avgDurationMs, durationSampleSize: durations.length, recentFailureCodes24h: failureCounts, failureSampleSize24h: recentFailures.length, worker: { health: workerHealth, status: worker?.status ?? null, lastHeartbeatAt: worker?.lastHeartbeatAt ?? null, heartbeatAgeMs: workerHeartbeatAgeMs, lastSuccessAt: worker?.lastSuccessAt ?? null, lastErrorAt: worker?.lastErrorAt ?? null, lastErrorCode: worker?.lastErrorCode ?? null, consecutiveFailures: worker?.consecutiveFailures ?? 0 } } });
}));
// P435: requester-scoped export job management and recovery actions.
curriculumRouter.get("/:organizationId/:schoolId/lesson-reflection-task-reminder-policy-export-jobs", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const jobs = await withTenantContext(prisma, s, tx => tx.teacherTaskReminderPolicyExportJob.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId, requestedByUserId: s.userId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: limit, select: { id: true, status: true, rowCount: true, errorCode: true, attemptCount: true, createdAt: true, startedAt: true, completedAt: true, expiresAt: true } }));
  return res.json({ data: jobs });
}));
curriculumRouter.post("/:organizationId/:schoolId/lesson-reflection-task-reminder-policy-export-jobs/:jobId/cancel", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const result = await withTenantContext(prisma, s, tx => tx.teacherTaskReminderPolicyExportJob.updateMany({ where: { id: req.params.jobId, organizationId: s.organizationId, schoolId: s.schoolId, requestedByUserId: s.userId, status: "QUEUED" }, data: { status: "EXPIRED", errorCode: "CANCELLED_BY_REQUESTER", completedAt: new Date() } }));
  if (!result.count) return res.status(409).json({ error: "Only queued export jobs can be cancelled" });
  return res.json({ data: { id: req.params.jobId, status: "EXPIRED", cancelled: true } });
}));
curriculumRouter.post("/:organizationId/:schoolId/lesson-reflection-task-reminder-policy-export-jobs/:jobId/retry", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const result = await withTenantContext(prisma, s, tx => tx.teacherTaskReminderPolicyExportJob.updateMany({ where: { id: req.params.jobId, organizationId: s.organizationId, schoolId: s.schoolId, requestedByUserId: s.userId, status: "FAILED" }, data: { status: "QUEUED", attemptCount: 0, errorCode: null, startedAt: null, completedAt: null, expiresAt: null, csvContent: null, rowCount: null } }));
  if (!result.count) return res.status(409).json({ error: "Only failed export jobs can be retried" });
  return res.status(202).json({ data: { id: req.params.jobId, status: "QUEUED", retryQueued: true } });
}));
curriculumRouter.get("/:organizationId/:schoolId/lesson-reflection-task-reminder-policy-export-jobs/:jobId", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const job = await withTenantContext(prisma, s, tx => tx.teacherTaskReminderPolicyExportJob.findFirst({ where: { id: req.params.jobId, organizationId: s.organizationId, schoolId: s.schoolId, requestedByUserId: s.userId }, select: { id: true, status: true, rowCount: true, errorCode: true, createdAt: true, startedAt: true, completedAt: true, expiresAt: true } }));
  if (!job) return res.status(404).json({ error: "Export job not found" }); return res.json({ data: job });
}));
curriculumRouter.get("/:organizationId/:schoolId/lesson-reflection-task-reminder-policy-export-jobs/:jobId/download", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const job = await withTenantContext(prisma, s, tx => tx.teacherTaskReminderPolicyExportJob.findFirst({ where: { id: req.params.jobId, organizationId: s.organizationId, schoolId: s.schoolId, requestedByUserId: s.userId } }));
  if (!job) return res.status(404).json({ error: "Export job not found" });
  if (job.status !== "COMPLETED" || !job.csvContent) return res.status(409).json({ error: "Export is not ready" });
  if (job.expiresAt && job.expiresAt <= new Date()) return res.status(410).json({ error: "Export expired" });
  res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", `attachment; filename=reminder-policy-audit-${job.id}.csv`); return res.send(job.csvContent);
}));

curriculumRouter.get("/:organizationId/:schoolId/lesson-reflection-task-reminder-policy-history", asyncRoute(async (req, res) => {
  const s = await scope(req, res, "academics.manage"); if (!s) return;
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
  const before = req.query.before ? new Date(String(req.query.before)) : undefined;
  const after = req.query.after ? new Date(String(req.query.after)) : undefined;
  if ((before && Number.isNaN(before.getTime())) || (after && Number.isNaN(after.getTime()))) return res.status(400).json({ error: "Invalid date filter" });
  if (before && after && after > before) return res.status(400).json({ error: "From date must not be after To date" });
  const action = req.query.action ? String(req.query.action).toUpperCase() : undefined;
  if (action && !["CREATE", "UPDATE", "RESET"].includes(action)) return res.status(400).json({ error: "Invalid action filter" });
  const actor = req.query.actor ? String(req.query.actor).trim().slice(0, 128) : undefined;
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
  const data = await withTenantContext(prisma, s, async tx => {
    const where: any = { organizationId: s.organizationId, schoolId: s.schoolId,
      ...(action ? { action } : {}), ...(actor ? { actorUserId: { contains: actor, mode: "insensitive" } } : {}),
      ...(before || after ? { createdAt: { ...(before ? { lt: before } : {}), ...(after ? { gte: after } : {}) } } : {}) };
    let cursorRow: any = null;
    if (cursor) cursorRow = await tx.teacherTaskReminderPolicyAudit.findFirst({ where: { id: cursor, organizationId: s.organizationId, schoolId: s.schoolId }, select: { id: true, createdAt: true } });
    if (cursor && !cursorRow) return { entries: [], nextCursor: null, total: 0 };
    const pageWhere = cursorRow ? { ...where, OR: [{ createdAt: { lt: cursorRow.createdAt } }, { createdAt: cursorRow.createdAt, id: { lt: cursorRow.id } }] } : where;
    if (req.query.format === "csv") return { entries: await tx.teacherTaskReminderPolicyAudit.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 1000 }), nextCursor: null, total: 0 };
    const entries = await tx.teacherTaskReminderPolicyAudit.findMany({ where: pageWhere, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: limit + 1 });
    const hasMore = entries.length > limit; const page = hasMore ? entries.slice(0, limit) : entries;
    return { entries: page, nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null, total: await tx.teacherTaskReminderPolicyAudit.count({ where }) };
  });
  if (req.query.format === "csv") {
    const rows = (data as any).entries as any[];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = ["createdAt,actorUserId,action,previousValues,newValues", ...rows.map(r => [r.createdAt.toISOString(), r.actorUserId, r.action, JSON.stringify(r.previousValues), JSON.stringify(r.newValues)].map(esc).join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", "attachment; filename=reminder-policy-audit.csv"); return res.send(csv);
  }
  return res.json({ data: (data as any).entries, nextCursor: (data as any).nextCursor, total: (data as any).total, limit });
}));
