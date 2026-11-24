-- P13 attendance hardening
CREATE UNIQUE INDEX "AttendanceCorrection_one_pending_per_attendance"
ON "AttendanceCorrectionRequest" ("attendanceId")
WHERE "status" = 'PENDING';

CREATE INDEX "StudentAttendance_school_session_status_idx"
ON "StudentAttendance" ("organizationId","schoolId","sessionId","status");
CREATE INDEX "AttendanceSession_grade_date_status_idx"
ON "AttendanceSession" ("organizationId","schoolId","gradeLevelId","sessionDate","status");
CREATE INDEX "AttendanceCorrection_review_queue_idx"
ON "AttendanceCorrectionRequest" ("organizationId","schoolId","status","createdAt");

ALTER TABLE "AttendanceSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceSession" FORCE ROW LEVEL SECURITY;
ALTER TABLE "StudentAttendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentAttendance" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceCorrectionRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceCorrectionRequest" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceAuditEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceAuditEvent" FORCE ROW LEVEL SECURITY;
