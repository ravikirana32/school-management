BEGIN;
CREATE TABLE "SecurityOperationsRecord" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "category" VARCHAR(40) NOT NULL, "title" VARCHAR(200) NOT NULL,
 "description" VARCHAR(4000) NOT NULL, "severity" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
 "status" VARCHAR(30) NOT NULL DEFAULT 'OPEN', "ownerUserId" TEXT, "dueAt" TIMESTAMP(3),
 "evidenceReference" VARCHAR(500), "metadata" JSONB, "createdBy" TEXT NOT NULL, "updatedBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SecurityOperationsRecord_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "security_ops_tenant_category_status_created_idx" ON "SecurityOperationsRecord"("organizationId","schoolId","category","status","createdAt");
CREATE INDEX "security_ops_tenant_due_idx" ON "SecurityOperationsRecord"("organizationId","schoolId","dueAt");
ALTER TABLE "SecurityOperationsRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SecurityOperationsRecord" FORCE ROW LEVEL SECURITY;
CREATE POLICY "security_ops_tenant_isolation" ON "SecurityOperationsRecord"
 USING ("organizationId"=current_setting('app.current_organization_id',true) AND "schoolId"=current_setting('app.current_school_id',true))
 WITH CHECK ("organizationId"=current_setting('app.current_organization_id',true) AND "schoolId"=current_setting('app.current_school_id',true));
COMMIT;
