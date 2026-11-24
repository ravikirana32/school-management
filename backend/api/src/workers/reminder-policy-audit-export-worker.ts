import { prisma } from "../lib/prisma.js";
import { withPlatformContext, withTenantContext } from "../modules/auth/tenant-context.js";
import { createWorkerShutdown } from "./graceful-shutdown.js";

const WORKER = "reminder-policy-audit-export-worker";
const INTERVAL_MS = Math.max(1_000, Math.min(120_000, Number(process.env.REMINDER_AUDIT_EXPORT_WORKER_INTERVAL_MS) || 15_000));
const SCHOOL_SCAN_LIMIT = Math.max(10, Math.min(500, Number(process.env.REMINDER_AUDIT_EXPORT_SCHOOL_SCAN_LIMIT) || 200));
// P439: concurrency is bounded and each job is claimed with a conditional QUEUED status update.
const WORKER_CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.REMINDER_AUDIT_EXPORT_WORKER_CONCURRENCY) || 2));
const HEARTBEAT_INTERVAL_MS = Math.max(10_000, Math.min(60_000, Number(process.env.REMINDER_AUDIT_EXPORT_WORKER_HEARTBEAT_INTERVAL_MS) || 30_000));
let lastServedSchoolKey: string | null = null;
const MAX_ROWS = 50_000;
const EXPIRY_MS = 24 * 60 * 60 * 1000;
let running = false;
let cycleCount = 0;
let completedJobs = 0;
let failedJobs = 0;
let lastCycleDurationMs: number | null = null;
async function heartbeat(status: "HEALTHY" | "DEGRADED" | "STARTING", errorCode?: string) {
  const now = new Date();
  await prisma.$executeRawUnsafe(`INSERT INTO "BackgroundWorkerHeartbeat" ("workerName","status","lastHeartbeatAt","lastSuccessAt","lastErrorAt","lastErrorCode","consecutiveFailures","updatedAt") VALUES ($1,$2,$3,CASE WHEN $2='HEALTHY' THEN $3 ELSE NULL END,CASE WHEN $2='DEGRADED' THEN $3 ELSE NULL END,$4,CASE WHEN $2='DEGRADED' THEN 1 ELSE 0 END,$3) ON CONFLICT ("workerName") DO UPDATE SET "status"=EXCLUDED."status","lastHeartbeatAt"=EXCLUDED."lastHeartbeatAt","lastSuccessAt"=CASE WHEN EXCLUDED."status"='HEALTHY' THEN EXCLUDED."lastHeartbeatAt" ELSE "BackgroundWorkerHeartbeat"."lastSuccessAt" END,"lastErrorAt"=CASE WHEN EXCLUDED."status"='DEGRADED' THEN EXCLUDED."lastHeartbeatAt" ELSE "BackgroundWorkerHeartbeat"."lastErrorAt" END,"lastErrorCode"=COALESCE(EXCLUDED."lastErrorCode","BackgroundWorkerHeartbeat"."lastErrorCode"),"consecutiveFailures"=CASE WHEN EXCLUDED."status"='HEALTHY' THEN 0 ELSE "BackgroundWorkerHeartbeat"."consecutiveFailures"+1 END,"updatedAt"=EXCLUDED."updatedAt"`, WORKER, status, now, errorCode || null);
}
function csv(rows: any[]) {
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return ["createdAt,actorUserId,action,previousValues,newValues", ...rows.map(r => [r.createdAt.toISOString(), r.actorUserId, r.action, JSON.stringify(r.previousValues), JSON.stringify(r.newValues)].map(escape).join(","))].join("\n");
}
async function processJob(job: any) {
  const claimed = await withPlatformContext(prisma, tx => tx.teacherTaskReminderPolicyExportJob.updateMany({ where: { id: job.id, status: "QUEUED" }, data: { status: "PROCESSING", startedAt: new Date(), attemptCount: { increment: 1 } } }));
  if (!claimed.count) return false;
  lastServedSchoolKey = `${job.organizationId}:${job.schoolId}`;
  try {
    const f = job.filters as any;
    const audits = await withTenantContext(prisma, { organizationId: job.organizationId, schoolId: job.schoolId, userId: "REMINDER_AUDIT_EXPORT_WORKER" }, tx => tx.teacherTaskReminderPolicyAudit.findMany({
      where: { organizationId: job.organizationId, schoolId: job.schoolId, ...(f.action ? { action: f.action } : {}), ...(f.actor ? { actorUserId: { contains: f.actor, mode: "insensitive" } } : {}), ...(f.after || f.before ? { createdAt: { ...(f.after ? { gte: new Date(f.after) } : {}), ...(f.before ? { lt: new Date(f.before) } : {}) } } : {}) },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: MAX_ROWS
    }));
    const content = csv(audits); const completedAt = new Date();
    await withPlatformContext(prisma, tx => tx.teacherTaskReminderPolicyExportJob.update({ where: { id: job.id }, data: { status: "COMPLETED", csvContent: content, rowCount: audits.length, completedAt, expiresAt: new Date(completedAt.getTime() + EXPIRY_MS) } }));
    completedJobs += 1;
    console.info(`[${WORKER}] export completed`, job.id, audits.length);
  } catch (err) {
    const errorCode = (err instanceof Error ? err.name : "ExportError").slice(0, 64);
    await withPlatformContext(prisma, tx => tx.teacherTaskReminderPolicyExportJob.update({ where: { id: job.id }, data: { status: "FAILED", errorCode, completedAt: new Date() } })).catch(() => undefined);
    failedJobs += 1;
    console.error(`[${WORKER}] job failed`, job.id, errorCode);
  }
  return true;
}
async function cycle() {
  if (running) return; running = true; const cycleStartedAt = Date.now();
  try {
    const candidates = await withPlatformContext(prisma, tx => tx.teacherTaskReminderPolicyExportJob.findMany({
      where: { status: "QUEUED" }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: SCHOOL_SCAN_LIMIT
    }));
    // P438/P439: select distinct-school jobs first, rotating away from the last school served;
    // then fill remaining slots from FIFO so single-school queues still progress.
    const selected: any[] = []; const selectedSchools = new Set<string>();
    for (const candidate of candidates) {
      const schoolKey = `${candidate.organizationId}:${candidate.schoolId}`;
      if (schoolKey !== lastServedSchoolKey && !selectedSchools.has(schoolKey)) {
        selected.push(candidate); selectedSchools.add(schoolKey);
        if (selected.length >= WORKER_CONCURRENCY) break;
      }
    }
    if (selected.length < WORKER_CONCURRENCY) {
      for (const candidate of candidates) {
        const schoolKey = `${candidate.organizationId}:${candidate.schoolId}`;
        if (!selected.some(item => item.id === candidate.id)) {
          selected.push(candidate); selectedSchools.add(schoolKey);
          if (selected.length >= WORKER_CONCURRENCY) break;
        }
      }
    }
    // Conditional claims protect against duplicate work if another worker instance sees the same candidates.
    await Promise.all(selected.map(candidate => processJob(candidate)));
    const now = new Date(); const recoveryCutoff = new Date(now.getTime() - 10 * 60 * 1000);
    await withPlatformContext(prisma, tx => tx.teacherTaskReminderPolicyExportJob.updateMany({ where: { status: "PROCESSING", startedAt: { lte: recoveryCutoff }, attemptCount: { lt: 3 } }, data: { status: "QUEUED", errorCode: "RECOVERED_STALE_PROCESSING", startedAt: null } })).catch(() => undefined);
    await withPlatformContext(prisma, tx => tx.teacherTaskReminderPolicyExportJob.updateMany({ where: { status: "PROCESSING", startedAt: { lte: recoveryCutoff }, attemptCount: { gte: 3 } }, data: { status: "FAILED", errorCode: "MAX_RECOVERY_ATTEMPTS", completedAt: now } })).catch(() => undefined);
    await withPlatformContext(prisma, tx => tx.teacherTaskReminderPolicyExportJob.updateMany({ where: { status: "COMPLETED", expiresAt: { lte: now } }, data: { status: "EXPIRED", csvContent: null } })).catch(() => undefined);
    await withPlatformContext(prisma, tx => tx.teacherTaskReminderPolicyExportJob.updateMany({ where: { status: { in: ["QUEUED", "PROCESSING"] }, createdAt: { lte: new Date(now.getTime() - EXPIRY_MS) }, csvContent: null }, data: { status: "EXPIRED", errorCode: "JOB_STALE", completedAt: now } })).catch(() => undefined);
    cycleCount += 1; lastCycleDurationMs = Date.now() - cycleStartedAt; await heartbeat("HEALTHY");
    console.info(`[${WORKER}] cycle healthy`, { cycleCount, completedJobs, failedJobs, durationMs: lastCycleDurationMs });
  } catch (err) { const code = (err instanceof Error ? err.name : "UnknownError").slice(0, 80); await heartbeat("DEGRADED", code).catch(() => undefined); console.error(`[${WORKER}] cycle error`, code); }
  finally { running = false; }
}
void heartbeat("STARTING").catch(() => undefined).finally(() => void cycle()); const timer = setInterval(() => void cycle(), INTERVAL_MS); const heartbeatTimer = setInterval(() => void heartbeat("HEALTHY").catch(() => undefined), HEARTBEAT_INTERVAL_MS);
createWorkerShutdown(WORKER, async () => { clearInterval(timer); clearInterval(heartbeatTimer); await prisma.$disconnect(); });
