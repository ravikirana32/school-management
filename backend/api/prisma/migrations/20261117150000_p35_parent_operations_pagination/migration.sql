-- P35: composite keyset pagination indexes for School Admin parent operations.
-- The id tie-breaker makes ordering deterministic when createdAt timestamps tie.
CREATE INDEX IF NOT EXISTS "StudentFeeCharge_school_created_id_idx"
  ON "StudentFeeCharge" ("organizationId", "schoolId", "createdAt" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "HomeworkAssignment_school_created_id_idx"
  ON "HomeworkAssignment" ("organizationId", "schoolId", "createdAt" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "StudentReportCard_school_created_id_idx"
  ON "StudentReportCard" ("organizationId", "schoolId", "createdAt" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "ParentNotification_school_created_id_idx"
  ON "ParentNotification" ("organizationId", "schoolId", "createdAt" DESC, "id" DESC);
