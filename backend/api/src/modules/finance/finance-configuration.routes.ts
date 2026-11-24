import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";

export const financeConfigurationRouter = Router();
financeConfigurationRouter.use(authenticate);
export const financeConfigurationDefaults = {
  currency: "INR",
  feeCategories: [
    { code: "TUITION", label: "Tuition Fee", active: true },
    { code: "ADMISSION", label: "Admission Fee", active: true },
    { code: "TRANSPORT", label: "Transport Fee", active: true },
    { code: "BOOKS", label: "Books & Materials", active: true },
    { code: "UNIFORM", label: "Uniform Fee", active: true },
    { code: "EXAM", label: "Examination Fee", active: true },
    { code: "OTHER", label: "Other Fee", active: true }
  ],
  paymentMethods: [
    { code: "CASH", label: "Cash", enabled: true },
    { code: "UPI", label: "UPI", enabled: true },
    { code: "BANK_TRANSFER", label: "Bank Transfer", enabled: true },
    { code: "CHEQUE", label: "Cheque", enabled: true },
    { code: "CARD", label: "Card", enabled: true },
    { code: "OTHER", label: "Other", enabled: true }
  ],
  invoicePrefix: "INV",
  receiptPrefix: "RCT",
  requireReferenceForNonCash: true
};
const configurationSchema = z.object({
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/).transform(v => v.toUpperCase()),
  feeCategories: z.array(z.object({ code: z.string().trim().regex(/^[A-Z0-9_-]{2,24}$/), label: z.string().trim().min(2).max(80), active: z.boolean() })).min(1).max(30),
  paymentMethods: z.array(z.object({ code: z.string().trim().regex(/^[A-Z0-9_-]{2,24}$/), label: z.string().trim().min(2).max(60), enabled: z.boolean() })).min(1).max(20),
  invoicePrefix: z.string().trim().regex(/^[A-Z0-9_-]{1,12}$/),
  receiptPrefix: z.string().trim().regex(/^[A-Z0-9_-]{1,12}$/),
  requireReferenceForNonCash: z.boolean()
}).superRefine((value, ctx) => {
  for (const [key, entries] of [["feeCategories", value.feeCategories], ["paymentMethods", value.paymentMethods]] as const) {
    const codes = entries.map(entry => entry.code.toUpperCase());
    if (new Set(codes).size !== codes.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `Duplicate ${key} code` });
  }
});
function route(fn: (req: any, res: any) => Promise<any>) { return (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next); }
async function scope(req: any, res: any) {
  const organizationId = String(req.params.organizationId || "");
  const schoolId = String(req.params.schoolId || "");
  const userId = req.auth!.userId;
  if (!await hasActiveSchoolMembership(userId, organizationId, schoolId)) { res.status(403).json({ error: "Active school membership required" }); return null; }
  return { organizationId, schoolId, userId };
}
async function allowed(s: any, res: any, permission: string) { if (!await hasSchoolPermission(s.userId, s.organizationId, s.schoolId, permission)) { res.status(403).json({ error: `Missing required school permission: ${permission}` }); return false; } return true; }
financeConfigurationRouter.get("/:organizationId/:schoolId/configuration", route(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await allowed(s, res, "fees.read"))) return;
  const rows = await withTenantContext(prisma, s, tx => tx.$queryRaw<any[]>`SELECT "configuration", "version", "updatedAt" FROM "SchoolFinanceConfiguration" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId} LIMIT 1`);
  return res.json({ data: rows[0] ?? { configuration: financeConfigurationDefaults, version: 0, updatedAt: null } });
}));
financeConfigurationRouter.put("/:organizationId/:schoolId/configuration", route(async (req, res) => {
  const s = await scope(req, res); if (!s || !(await allowed(s, res, "fees.manage"))) return;
  const parsed = configurationSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Invalid finance configuration", details: parsed.error.flatten() });
  const json = JSON.stringify(parsed.data);
  const outcome = await withTenantContext(prisma, s, async tx => {
    const rows = await tx.$queryRaw<any[]>`INSERT INTO "SchoolFinanceConfiguration"("id", "organizationId", "schoolId", "configuration", "version", "updatedBy")
      VALUES (${`sfc_${s.schoolId}`}, ${s.organizationId}, ${s.schoolId}, ${json}::jsonb, 1, ${s.userId})
      ON CONFLICT ("schoolId") DO UPDATE SET "configuration"=EXCLUDED."configuration", "version"="SchoolFinanceConfiguration"."version"+1, "updatedBy"=EXCLUDED."updatedBy", "updatedAt"=NOW()
      WHERE "SchoolFinanceConfiguration"."organizationId"=EXCLUDED."organizationId"
      RETURNING "configuration", "version", "updatedAt"`;
    if (!rows.length) return { conflict: true, row: null };
    await tx.$executeRaw`INSERT INTO "AuditLog"("id", "actorUserId", "organizationId", "schoolId", "action", "resourceType", "resourceId", "outcome", "metadata", "createdAt") VALUES (${randomUUID()}, ${s.userId}, ${s.organizationId}, ${s.schoolId}, 'finance.configuration.updated', 'SchoolFinanceConfiguration', ${s.schoolId}, 'SUCCESS', ${JSON.stringify({ version: rows[0].version })}::jsonb, NOW()`;
    return { conflict: false, row: rows[0] };
  });
  if (outcome.conflict) return res.status(409).json({ error: "Finance configuration scope conflict" });
  return res.json({ data: outcome.row });
}));
