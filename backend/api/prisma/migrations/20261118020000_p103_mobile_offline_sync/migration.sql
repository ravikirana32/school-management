BEGIN;
CREATE TABLE "MobileMutationReceipt" (
 "id" TEXT NOT NULL,
 "organizationId" TEXT NOT NULL,
 "schoolId" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "idempotencyKey" VARCHAR(128) NOT NULL,
 "payloadHash" VARCHAR(64) NOT NULL,
 "response" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "MobileMutationReceipt_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MobileMutationReceipt_org_school_user_key_key"
 ON "MobileMutationReceipt"("organizationId","schoolId","userId","idempotencyKey");
CREATE INDEX "MobileMutationReceipt_org_school_created_idx"
 ON "MobileMutationReceipt"("organizationId","schoolId","createdAt");
CREATE INDEX "MobileMutationReceipt_user_created_idx"
 ON "MobileMutationReceipt"("userId","createdAt");
ALTER TABLE "MobileMutationReceipt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MobileMutationReceipt" FORCE ROW LEVEL SECURITY;
CREATE POLICY "mobile_mutation_receipt_tenant_isolation" ON "MobileMutationReceipt"
 USING ("organizationId"=current_setting('app.current_organization_id',true)
    AND "schoolId"=current_setting('app.current_school_id',true)
    AND "userId"=current_setting('app.current_user_id',true))
 WITH CHECK ("organizationId"=current_setting('app.current_organization_id',true)
    AND "schoolId"=current_setting('app.current_school_id',true)
    AND "userId"=current_setting('app.current_user_id',true));
COMMIT;
