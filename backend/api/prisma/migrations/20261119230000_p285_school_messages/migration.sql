CREATE TABLE "SchoolMessageThread" (
 "id" TEXT NOT NULL,
 "organizationId" TEXT NOT NULL,
 "schoolId" TEXT NOT NULL,
 "subject" VARCHAR(160) NOT NULL,
 "category" VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
 "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
 "createdBy" TEXT NOT NULL,
 "creatorRole" VARCHAR(20) NOT NULL,
 "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SchoolMessageThread_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SchoolMessageThread_id_org_school_key" ON "SchoolMessageThread"("id","organizationId","schoolId");
CREATE INDEX "SchoolMessageThread_org_school_status_lastMessage_idx" ON "SchoolMessageThread"("organizationId","schoolId","status","lastMessageAt" DESC);
CREATE INDEX "SchoolMessageThread_org_school_createdBy_lastMessage_idx" ON "SchoolMessageThread"("organizationId","schoolId","createdBy","lastMessageAt" DESC);
CREATE TABLE "SchoolMessage" (
 "id" TEXT NOT NULL,
 "organizationId" TEXT NOT NULL,
 "schoolId" TEXT NOT NULL,
 "threadId" TEXT NOT NULL,
 "senderUserId" TEXT NOT NULL,
 "senderRole" VARCHAR(20) NOT NULL,
 "body" VARCHAR(4000) NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "SchoolMessage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SchoolMessage_id_org_school_key" ON "SchoolMessage"("id","organizationId","schoolId");
CREATE INDEX "SchoolMessage_org_school_thread_created_idx" ON "SchoolMessage"("organizationId","schoolId","threadId","createdAt");
ALTER TABLE "SchoolMessage" ADD CONSTRAINT "SchoolMessage_thread_fkey" FOREIGN KEY ("threadId","organizationId","schoolId") REFERENCES "SchoolMessageThread"("id","organizationId","schoolId") ON DELETE CASCADE;
ALTER TABLE "SchoolMessageThread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolMessageThread" FORCE ROW LEVEL SECURITY;
CREATE POLICY "SchoolMessageThread_tenant_policy" ON "SchoolMessageThread" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
ALTER TABLE "SchoolMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolMessage" FORCE ROW LEVEL SECURITY;
CREATE POLICY "SchoolMessage_tenant_policy" ON "SchoolMessage" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
