-- P65: one suppression can carry multiple HMAC-version aliases without storing plaintext email.
CREATE TABLE "NotificationEmailSuppressionHashAlias" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "suppressionId" TEXT NOT NULL,
  "hashVersion" VARCHAR(20) NOT NULL,
  "emailHash" VARCHAR(64) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE','RELEASED')),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "releasedAt" TIMESTAMP(3),
  CONSTRAINT "NotificationEmailSuppressionHashAlias_suppression_version_key" UNIQUE("suppressionId","hashVersion"),
  CONSTRAINT "NotificationEmailSuppressionHashAlias_suppression_fk" FOREIGN KEY("suppressionId","organizationId","schoolId") REFERENCES "NotificationEmailSuppression"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE INDEX "NotificationEmailSuppressionHashAlias_lookup_idx"
  ON "NotificationEmailSuppressionHashAlias"("organizationId","schoolId","hashVersion","emailHash","status");
CREATE INDEX "NotificationEmailSuppressionHashAlias_suppression_status_idx"
  ON "NotificationEmailSuppressionHashAlias"("suppressionId","status");
CREATE UNIQUE INDEX "NotificationEmailSuppressionHashAlias_active_hash_key"
  ON "NotificationEmailSuppressionHashAlias"("organizationId","schoolId","hashVersion","emailHash") WHERE "status"='ACTIVE';

-- Backfill each historical suppression's known HMAC/version as its first alias.
INSERT INTO "NotificationEmailSuppressionHashAlias" (
  "id","organizationId","schoolId","suppressionId","hashVersion","emailHash","status","createdAt","releasedAt"
)
SELECT gen_random_uuid()::text,"organizationId","schoolId","id","hashVersion","emailHash","status","createdAt","releasedAt"
FROM "NotificationEmailSuppression";

ALTER TABLE "NotificationEmailSuppressionHashAlias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationEmailSuppressionHashAlias" FORCE ROW LEVEL SECURITY;
CREATE POLICY "NotificationEmailSuppressionHashAlias_tenant_policy"
  ON "NotificationEmailSuppressionHashAlias"
  USING ("organizationId"=current_setting('app.current_organization_id',true) AND "schoolId"=current_setting('app.current_school_id',true))
  WITH CHECK ("organizationId"=current_setting('app.current_organization_id',true) AND "schoolId"=current_setting('app.current_school_id',true));
CREATE POLICY "NotificationEmailSuppressionHashAlias_worker_policy"
  ON "NotificationEmailSuppressionHashAlias"
  FOR SELECT USING (current_setting('app.notification_worker',true)='true');
