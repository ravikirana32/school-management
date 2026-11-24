ALTER TABLE "LibraryReservation"	ADD COLUMN "copyId" TEXT,
	ADD COLUMN "pickupExpiresAt" TIMESTAMP(3),
	ADD COLUMN "fulfilledAt" TIMESTAMP(3),
	ADD COLUMN "cancelledAt" TIMESTAMP(3);
CREATE INDEX "LibraryReservation_copyId_status_idx" ON "LibraryReservation"("copyId", "status");
CREATE INDEX "LibraryReservation_organizationId_schoolId_status_createdAt_idx" ON "LibraryReservation"("organizationId", "schoolId", "status", "createdAt");
