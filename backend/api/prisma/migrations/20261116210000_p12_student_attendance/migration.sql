-- P12 student attendance foundation. Run after P11.
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_id_org_school_key" UNIQUE ("id","organizationId","schoolId");

CREATE TYPE "AttendanceSessionStatus" AS ENUM ('DRAFT','OPEN','SUBMITTED','LOCKED');
CREATE TYPE "StudentAttendanceStatus" AS ENUM ('PRESENT','ABSENT','LATE','HALF_DAY','EXCUSED','LEAVE');
CREATE TYPE "AttendanceMarkSource" AS ENUM ('TEACHER','ADMIN','IMPORT','SYSTEM');
CREATE TYPE "AttendanceCorrectionStatus" AS ENUM ('PENDING','APPROVED','REJECTED');

CREATE TABLE "AttendanceSession" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL, "gradeLevelId" TEXT NOT NULL, "sectionName" TEXT,
  "sessionDate" DATE NOT NULL, "status" "AttendanceSessionStatus" NOT NULL DEFAULT 'DRAFT',
  "openedAt" TIMESTAMP(3), "submittedAt" TIMESTAMP(3), "lockedAt" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL, "updatedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AttendanceSession_school_fkey" FOREIGN KEY ("schoolId","organizationId")
    REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "AttendanceSession_year_fkey" FOREIGN KEY ("academicYearId","organizationId","schoolId")
    REFERENCES "AcademicYear"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "AttendanceSession_grade_fkey" FOREIGN KEY ("gradeLevelId","organizationId","schoolId")
    REFERENCES "GradeLevel"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "AttendanceSession_date_check" CHECK ("sessionDate" IS NOT NULL),
  CONSTRAINT "AttendanceSession_state_check" CHECK (
    ("status" <> 'OPEN' OR "openedAt" IS NOT NULL) AND
    ("status" <> 'SUBMITTED' OR "submittedAt" IS NOT NULL) AND
    ("status" <> 'LOCKED' OR ("submittedAt" IS NOT NULL AND "lockedAt" IS NOT NULL))
  )
);
CREATE UNIQUE INDEX "AttendanceSession_scope_unique" ON "AttendanceSession"
 ("organizationId","schoolId","academicYearId","gradeLevelId",COALESCE("sectionName",''),"sessionDate");
CREATE UNIQUE INDEX "AttendanceSession_id_scope_unique" ON "AttendanceSession"("id","organizationId","schoolId");
CREATE INDEX "AttendanceSession_date_status_idx" ON "AttendanceSession"("organizationId","schoolId","sessionDate","status");

CREATE TABLE "StudentAttendance" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL, "studentId" TEXT NOT NULL, "enrollmentId" TEXT,
  "status" "StudentAttendanceStatus" NOT NULL, "arrivalTime" TIMESTAMP(3),
  "remarks" VARCHAR(500), "markedBy" TEXT NOT NULL,
  "source" "AttendanceMarkSource" NOT NULL DEFAULT 'TEACHER',
  "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "correctedBy" TEXT, "correctedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentAttendance_session_fkey" FOREIGN KEY ("sessionId","organizationId","schoolId")
    REFERENCES "AttendanceSession"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "StudentAttendance_student_fkey" FOREIGN KEY ("studentId","organizationId","schoolId")
    REFERENCES "Student"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "StudentAttendance_enrollment_fkey" FOREIGN KEY ("enrollmentId","organizationId","schoolId")
    REFERENCES "StudentEnrollment"("id","organizationId","schoolId") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "StudentAttendance_session_student_key" ON "StudentAttendance"("sessionId","studentId");
CREATE UNIQUE INDEX "StudentAttendance_id_scope_unique" ON "StudentAttendance"("id","organizationId","schoolId");
CREATE INDEX "StudentAttendance_student_date_idx" ON "StudentAttendance"("organizationId","schoolId","studentId","markedAt");

CREATE TABLE "AttendanceCorrectionRequest" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "attendanceId" TEXT NOT NULL, "studentId" TEXT NOT NULL, "requestedBy" TEXT NOT NULL,
  "reason" VARCHAR(1000) NOT NULL, "requestedStatus" "StudentAttendanceStatus" NOT NULL,
  "status" "AttendanceCorrectionStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedBy" TEXT, "reviewedAt" TIMESTAMP(3), "reviewNotes" VARCHAR(1000),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AttendanceCorrection_attendance_fkey" FOREIGN KEY ("attendanceId","organizationId","schoolId")
    REFERENCES "StudentAttendance"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "AttendanceCorrection_student_fkey" FOREIGN KEY ("studentId","organizationId","schoolId")
    REFERENCES "Student"("id","organizationId","schoolId") ON DELETE RESTRICT,
  CONSTRAINT "AttendanceCorrection_review_check" CHECK (
    ("status" = 'PENDING' AND "reviewedAt" IS NULL) OR
    ("status" <> 'PENDING' AND "reviewedAt" IS NOT NULL)
  )
);
CREATE INDEX "AttendanceCorrection_scope_status_idx" ON "AttendanceCorrectionRequest"("organizationId","schoolId","status","createdAt");

CREATE TABLE "AttendanceAuditEvent" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "attendanceId" TEXT, "studentId" TEXT, "actorUserId" TEXT NOT NULL,
  "eventType" VARCHAR(80) NOT NULL, "beforeData" JSONB, "afterData" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttendanceAudit_school_fkey" FOREIGN KEY ("schoolId","organizationId")
    REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "AttendanceAudit_attendance_fkey" FOREIGN KEY ("attendanceId","organizationId","schoolId")
    REFERENCES "StudentAttendance"("id","organizationId","schoolId") ON DELETE RESTRICT
);
CREATE INDEX "AttendanceAudit_attendance_idx" ON "AttendanceAuditEvent"("organizationId","schoolId","attendanceId","createdAt");

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['AttendanceSession','StudentAttendance','AttendanceCorrectionRequest','AttendanceAuditEvent'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',
      t || '_tenant_policy', t
    );
  END LOOP;
END $$;
