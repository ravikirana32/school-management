-- P21 reusable school-scoped bell schedules. Existing free-text room labels are
-- intentionally preserved; new timetable writes validate canonical room codes.
CREATE TABLE "BellScheduleTemplate" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "periods" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BellScheduleTemplate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BellScheduleTemplate_periods_array_check" CHECK (jsonb_typeof("periods") = 'array'),
  CONSTRAINT "BellScheduleTemplate_school_fkey" FOREIGN KEY ("schoolId", "organizationId") REFERENCES "School"("id", "organizationId") ON DELETE CASCADE,
  CONSTRAINT "BellScheduleTemplate_school_name_key" UNIQUE ("schoolId", "name"),
  CONSTRAINT "BellScheduleTemplate_id_org_school_key" UNIQUE ("id", "organizationId", "schoolId")
);
CREATE INDEX "BellScheduleTemplate_org_school_active_idx" ON "BellScheduleTemplate"("organizationId", "schoolId", "isActive");
ALTER TABLE "BellScheduleTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BellScheduleTemplate" FORCE ROW LEVEL SECURITY;
CREATE POLICY "Bell_schedule_template_tenant_isolation" ON "BellScheduleTemplate"
 USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
 WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
