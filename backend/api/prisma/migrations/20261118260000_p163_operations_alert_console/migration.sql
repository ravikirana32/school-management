-- P163 tenant-scoped alert console metadata. Existing platform alerts remain unscoped
-- and are intentionally not exposed to school tenants.
ALTER TABLE "OperationsAlertOutbox"
  ADD COLUMN IF NOT EXISTS "organizationId" TEXT,
  ADD COLUMN IF NOT EXISTS "schoolId" TEXT,
  ADD COLUMN IF NOT EXISTS "acknowledgedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "acknowledgedByUserId" TEXT;
CREATE INDEX IF NOT EXISTS "OperationsAlertOutbox_tenant_history_idx"
  ON "OperationsAlertOutbox" ("organizationId", "schoolId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "OperationsAlertOutbox_tenant_unacknowledged_idx"
  ON "OperationsAlertOutbox" ("organizationId", "schoolId", "acknowledgedAt", "createdAt" DESC);
