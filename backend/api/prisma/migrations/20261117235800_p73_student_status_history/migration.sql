CREATE TABLE "StudentStatusHistory" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "fromStatus" "StudentStatus" NOT NULL,
  "toStatus" "StudentStatus" NOT NULL,
  "reason" VARCHAR(1000),
  "effectiveAt" DATE NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentStatusHistory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentStatusHistory_student_fkey"
    FOREIGN KEY ("studentId", "organizationId", "schoolId")
    REFERENCES "Student"("id", "organizationId", "schoolId") ON DELETE CASCADE
);
CREATE INDEX "StudentStatusHistory_scope_student_created_idx"
  ON "StudentStatusHistory"("organizationId", "schoolId", "studentId", "createdAt");
CREATE INDEX "StudentStatusHistory_school_effective_idx"
  ON "StudentStatusHistory"("schoolId", "effectiveAt");
ALTER TABLE "StudentStatusHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentStatusHistory" FORCE ROW LEVEL SECURITY;
CREATE POLICY "StudentStatusHistory_tenant_policy" ON "StudentStatusHistory"
  USING ("organizationId" = current_setting('app.current_organization_id', true)
    AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true)
    AND "schoolId" = current_setting('app.current_school_id', true));
