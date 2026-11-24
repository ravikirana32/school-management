import { prisma } from "../lib/prisma.js";
import { createWorkerShutdown } from "./graceful-shutdown.js";

const WORKER_NAME = "admission-reservation-expiry-worker";
const INTERVAL_MS = Number(process.env.ADMISSION_RESERVATION_EXPIRY_INTERVAL_MS || 60_000);
const BATCH_SIZE = 100;
let running = false;


async function sweepExpiredReservations() {
  if (running) return;
  running = true;
  const now = new Date();
  try {
    const due = await prisma.admissionSeatReservation.findMany({
      where: { status: "ACTIVE", expiresAt: { lte: now } },
      select: { id: true },
      take: BATCH_SIZE,
      orderBy: { expiresAt: "asc" },
    });
    let released = 0;
    for (const item of due) {
      const result = await prisma.$transaction(async tx => {
        // Claim only still-active, already-expired reservations. This conditional update
        // makes repeated sweeps and concurrent worker instances safe/idempotent.
        const claimed = await tx.admissionSeatReservation.updateMany({
          where: { id: item.id, status: "ACTIVE", expiresAt: { lte: now } },
          data: { status: "EXPIRED", releasedAt: now, releaseReason: "Offer expired (automatic worker)" },
        });
        if (!claimed.count) return false;
        const reservation = await tx.admissionSeatReservation.findUnique({ where: { id: item.id }, select: { capacityId: true, offerId: true, organizationId: true, schoolId: true } });
        if (!reservation) return false;
        await tx.gradeSectionCapacity.updateMany({ where: { id: reservation.capacityId, reservedSeats: { gt: 0 } }, data: { reservedSeats: { decrement: 1 } } });
        await tx.admissionOffer.updateMany({ where: { id: reservation.offerId, organizationId: reservation.organizationId, schoolId: reservation.schoolId, status: "OFFERED" }, data: { status: "EXPIRED" } });
        return true;
      });
      if (result) released++;
    }
    if (released) console.info(`[${WORKER_NAME}] released ${released} expired reservation(s)`);
  } catch (error) {
    console.error(`[${WORKER_NAME}] sweep failed`, error instanceof Error ? error.message : "UnknownError");
  } finally {
    running = false;
  }
}


await sweepExpiredReservations();
const timer = setInterval(() => { void sweepExpiredReservations(); }, INTERVAL_MS);
const shutdown = createWorkerShutdown({ clearTimers: () => clearInterval(timer), closeWorker: async () => undefined, closeQueues: async () => undefined, disconnectDatabase: () => prisma.$disconnect() });
process.once("SIGINT", () => { void shutdown().catch(error => { console.error(`${WORKER_NAME} shutdown failed`, error); process.exitCode = 1; }); });
process.once("SIGTERM", () => { void shutdown().catch(error => { console.error(`${WORKER_NAME} shutdown failed`, error); process.exitCode = 1; }); });
