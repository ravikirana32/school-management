CREATE TABLE "StudentAccountLink" (
 "id" TEXT NOT NULL,
 "organizationId" TEXT NOT NULL,
 "schoolId" TEXT NOT NULL,
 "studentId" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
 "linkedBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "StudentAccountLink_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "StudentAccountLink" ADD CONSTRAINT "StudentAccountLink_student_fkey" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE;
CREATE UNIQUE INDEX "StudentAccountLink_school_student_key" ON "StudentAccountLink"("schoolId","studentId");
CREATE UNIQUE INDEX "StudentAccountLink_school_user_key" ON "StudentAccountLink"("schoolId","userId");
CREATE INDEX "StudentAccountLink_org_school_user_active_idx" ON "StudentAccountLink"("organizationId","schoolId","userId","isActive");
ALTER TABLE "StudentAccountLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentAccountLink" FORCE ROW LEVEL SECURITY;
CREATE POLICY "StudentAccountLink_tenant_policy" ON "StudentAccountLink" USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true)) WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
