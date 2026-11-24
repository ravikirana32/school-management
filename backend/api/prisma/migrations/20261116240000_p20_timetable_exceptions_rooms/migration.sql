CREATE TYPE "TimetableExceptionType" AS ENUM ('CANCEL', 'SUBSTITUTE', 'OVERRIDE');

-- P20: room inventory and date-specific timetable exceptions.
ALTER TABLE "TeacherTimetableSlot"
  ADD CONSTRAINT "TeacherTimetableSlot_id_organizationId_schoolId_key"
  UNIQUE ("id", "organizationId", "schoolId");

CREATE TABLE "SchoolRoom" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "roomType" TEXT,
  "capacity" INTEGER,
  "floor" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolRoom_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SchoolRoom_capacity_check" CHECK ("capacity" IS NULL OR "capacity" > 0),
  CONSTRAINT "SchoolRoom_school_fkey" FOREIGN KEY ("schoolId", "organizationId") REFERENCES "School"("id", "organizationId") ON DELETE CASCADE,
  CONSTRAINT "SchoolRoom_code_key" UNIQUE ("schoolId", "code"),
  CONSTRAINT "SchoolRoom_id_organizationId_schoolId_key" UNIQUE ("id", "organizationId", "schoolId")
);
CREATE INDEX "SchoolRoom_org_school_active_idx" ON "SchoolRoom"("organizationId", "schoolId", "isActive");
ALTER TABLE "SchoolRoom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolRoom" FORCE ROW LEVEL SECURITY;
CREATE POLICY "school_room_tenant_isolation" ON "SchoolRoom"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));

CREATE TABLE "TeacherTimetableException" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "timetableSlotId" TEXT NOT NULL,
  "exceptionDate" DATE NOT NULL,
  "exceptionType" "TimetableExceptionType" NOT NULL,
  "substituteAssignmentId" TEXT,
  "startsAt" TEXT,
  "endsAt" TEXT,
  "room" TEXT,
  "reason" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherTimetableException_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TeacherTimetableException_time_check" CHECK (("startsAt" IS NULL AND "endsAt" IS NULL) OR ("startsAt" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND "endsAt" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND "startsAt" < "endsAt")),
  CONSTRAINT "TeacherTimetableException_slot_fkey" FOREIGN KEY ("timetableSlotId", "organizationId", "schoolId") REFERENCES "TeacherTimetableSlot"("id", "organizationId", "schoolId") ON DELETE CASCADE,
  CONSTRAINT "TeacherTimetableException_substitute_fkey" FOREIGN KEY ("substituteAssignmentId", "organizationId", "schoolId") REFERENCES "TeacherAssignment"("id", "organizationId", "schoolId") ON DELETE RESTRICT,
  CONSTRAINT "TeacherTimetableException_school_fkey" FOREIGN KEY ("schoolId", "organizationId") REFERENCES "School"("id", "organizationId") ON DELETE CASCADE,
  CONSTRAINT "TeacherTimetableException_slot_date_key" UNIQUE ("timetableSlotId", "exceptionDate")
);
CREATE INDEX "TeacherTimetableException_org_school_date_idx" ON "TeacherTimetableException"("organizationId", "schoolId", "exceptionDate", "isActive");
ALTER TABLE "TeacherTimetableException" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherTimetableException" FORCE ROW LEVEL SECURITY;
CREATE POLICY "teacher_timetable_exception_tenant_isolation" ON "TeacherTimetableException"
  USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
