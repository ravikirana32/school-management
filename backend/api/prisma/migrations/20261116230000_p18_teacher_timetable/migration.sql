-- P18 teacher timetable slots. Tenant-scoped foreign keys and forced RLS.
ALTER TABLE "TeacherAssignment"
  ADD CONSTRAINT "TeacherAssignment_id_organizationId_schoolId_key" UNIQUE ("id", "organizationId", "schoolId");

CREATE TABLE "TeacherTimetableSlot" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherAssignmentId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "periodNumber" INTEGER NOT NULL,
  "startsAt" TEXT NOT NULL,
  "endsAt" TEXT NOT NULL,
  "subjectName" TEXT NOT NULL,
  "room" TEXT,
  "effectiveFrom" DATE,
  "effectiveTo" DATE,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherTimetableSlot_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TeacherTimetableSlot_day_check" CHECK ("dayOfWeek" BETWEEN 1 AND 7),
  CONSTRAINT "TeacherTimetableSlot_period_check" CHECK ("periodNumber" BETWEEN 1 AND 20),
  CONSTRAINT "TeacherTimetableSlot_time_format_check" CHECK ("startsAt" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND "endsAt" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  CONSTRAINT "TeacherTimetableSlot_time_order_check" CHECK ("startsAt" < "endsAt"),
  CONSTRAINT "TeacherTimetableSlot_effective_dates_check" CHECK ("effectiveFrom" IS NULL OR "effectiveTo" IS NULL OR "effectiveFrom" <= "effectiveTo"),
  CONSTRAINT "TeacherTimetableSlot_school_fkey" FOREIGN KEY ("schoolId", "organizationId") REFERENCES "School"("id", "organizationId") ON DELETE CASCADE,
  CONSTRAINT "TeacherTimetableSlot_assignment_fkey" FOREIGN KEY ("teacherAssignmentId", "organizationId", "schoolId") REFERENCES "TeacherAssignment"("id", "organizationId", "schoolId") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "TeacherTimetableSlot_assignment_day_period_effective_key"
  ON "TeacherTimetableSlot"("teacherAssignmentId", "dayOfWeek", "periodNumber", COALESCE("effectiveFrom", DATE '0001-01-01'));
CREATE INDEX "TeacherTimetableSlot_org_school_year_day_active_idx"
  ON "TeacherTimetableSlot"("organizationId", "schoolId", "academicYearId", "dayOfWeek", "isActive");
CREATE INDEX "TeacherTimetableSlot_assignment_active_day_idx"
  ON "TeacherTimetableSlot"("teacherAssignmentId", "isActive", "dayOfWeek");
ALTER TABLE "TeacherTimetableSlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherTimetableSlot" FORCE ROW LEVEL SECURITY;
CREATE POLICY "teacher_timetable_slot_tenant_isolation" ON "TeacherTimetableSlot"
  USING ("organizationId" = current_setting('app.current_organization_id', true)
     AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true)
     AND "schoolId" = current_setting('app.current_school_id', true));
