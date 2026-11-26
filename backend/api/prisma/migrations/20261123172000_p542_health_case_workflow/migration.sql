CREATE TABLE "StudentHealthCase" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "caseType" VARCHAR(40) NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "description" TEXT,
  "priority" VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  "status" VARCHAR(24) NOT NULL DEFAULT 'OPEN',
  "assignedToUserId" VARCHAR(191),
  "openedByUserId" VARCHAR(191) NOT NULL,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nextFollowUpAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentHealthCase_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "StudentHealthCase_student_scope_fk" FOREIGN KEY ("studentId","organizationId","schoolId")
    REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE INDEX "StudentHealthCase_org_school_student_status_priority_idx"
  ON "StudentHealthCase"("organizationId","schoolId","studentId","status","priority");

CREATE TABLE "StudentHealthCaseFollowUp" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "caseId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "recordedByUserId" VARCHAR(191) NOT NULL,
  "note" TEXT NOT NULL,
  "outcome" VARCHAR(1200),
  "nextFollowUpAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentHealthCaseFollowUp_case_scope_fk" FOREIGN KEY ("caseId","organizationId","schoolId")
    REFERENCES "StudentHealthCase"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE INDEX "StudentHealthCaseFollowUp_org_school_case_created_idx"
  ON "StudentHealthCaseFollowUp"("organizationId","schoolId","caseId","createdAt");
