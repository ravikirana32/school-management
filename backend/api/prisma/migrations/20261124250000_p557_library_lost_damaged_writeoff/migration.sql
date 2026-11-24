-- P557: library copy lifecycle metadata for lost, damaged and written-off copies
ALTER TABLE "LibraryCopy" ADD COLUMN "lifecycleReason" TEXT;
ALTER TABLE "LibraryCopy" ADD COLUMN "lifecycleUpdatedAt" TIMESTAMP(3);
ALTER TABLE "LibraryCopy" ADD COLUMN "writtenOffAt" TIMESTAMP(3);
CREATE INDEX "LibraryCopy_schoolId_status_lifecycleUpdatedAt_idx" ON "LibraryCopy"("schoolId", "status", "lifecycleUpdatedAt");
