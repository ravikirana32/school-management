import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { withReportCardVerificationContext } from "../auth/tenant-context.js";
import { isValidReportCardVerificationCode } from "./report-card-verification.js";
import { consumeVerificationRateLimit } from "./distributed-rate-limit.js";

export const reportCardVerificationRouter = Router();
reportCardVerificationRouter.get("/report-cards/verify/:code", async (req, res, next) => {
  try {
    let rate: Awaited<ReturnType<typeof consumeVerificationRateLimit>>;
    try { rate = await consumeVerificationRateLimit(req.ip || "unknown"); }
    catch { return res.status(503).json({ valid: false, error: "Verification service temporarily unavailable" }); }
    res.setHeader("RateLimit-Limit", "30");
    res.setHeader("RateLimit-Remaining", String(rate.remaining));
    res.setHeader("RateLimit-Reset", String(rate.retryAfterSeconds));
    if (!rate.allowed) { res.setHeader("Retry-After", String(rate.retryAfterSeconds)); return res.status(429).json({ valid: false, error: "Verification rate limit exceeded" }); }
    const code = String(req.params.code || "").toUpperCase();
    if (!isValidReportCardVerificationCode(code)) return res.status(404).json({ valid: false });
    const result = await withReportCardVerificationContext(prisma, async tx => {
      const artifact = await tx.reportCardPdfArtifact.findFirst({ where: { verificationCode: code }, select: { organizationId: true, schoolId: true, reportCardId: true, generatedAt: true } });
      if (!artifact) return null;
      const report = await tx.studentReportCard.findFirst({ where: { id: artifact.reportCardId, organizationId: artifact.organizationId, schoolId: artifact.schoolId, status: "PUBLISHED", publishedAt: { not: null } }, select: { academicYearId: true, termLabel: true } });
      if (!report) return null;
      const [school, year] = await Promise.all([
        tx.school.findFirst({ where: { id: artifact.schoolId, organizationId: artifact.organizationId }, select: { name: true } }),
        tx.academicYear.findFirst({ where: { id: report.academicYearId, organizationId: artifact.organizationId, schoolId: artifact.schoolId }, select: { name: true } })
      ]);
      if (!school || !year) return null;
      return { schoolName: school.name, academicYear: year.name, term: report.termLabel, issuedAt: artifact.generatedAt.toISOString() };
    });
    if (!result) return res.status(404).json({ valid: false, error: "Report card not found or no longer published" });
    return res.json({ valid: true, ...result, privacy: "No student identity or marks are disclosed by public verification." });
  } catch (error) { return next(error); }
});
