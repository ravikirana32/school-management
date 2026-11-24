CREATE TABLE "SchoolCommunication" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "body" VARCHAR(10000) NOT NULL,
  "audience" VARCHAR(20) NOT NULL,
  "priority" VARCHAR(12) NOT NULL DEFAULT 'NORMAL',
  "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  "createdBy" TEXT NOT NULL,
  "publishedBy" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolCommunication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SchoolCommunication_org_school_status_created_idx" ON "SchoolCommunication"("organizationId","schoolId","status","createdAt");
ALTER TABLE "SchoolCommunication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolCommunication" FORCE ROW LEVEL SECURITY;
CREATE POLICY "SchoolCommunication_tenant_policy" ON "SchoolCommunication" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
