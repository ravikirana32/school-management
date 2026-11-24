CREATE TABLE "StudentHealthProfile" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL, "bloodGroup" TEXT, "allergies" TEXT,
  "medicalConditions" TEXT, "medicationNotes" TEXT, "emergencyMedicalNotes" TEXT,
  "updatedBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentHealthProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentHealthProfile_studentId_key" UNIQUE ("studentId"),
  CONSTRAINT "StudentHealthProfile_student_scope_fkey" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "StudentHealthProfile_org_school_updated_idx" ON "StudentHealthProfile"("organizationId","schoolId","updatedAt");
CREATE TABLE "StudentHealthEvent" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL, "eventType" VARCHAR(40) NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "summary" VARCHAR(500) NOT NULL,
  "details" TEXT, "treatment" TEXT, "medication" TEXT, "parentNotifiedAt" TIMESTAMP(3),
  "recordedBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentHealthEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentHealthEvent_student_scope_fkey" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "StudentHealthEvent_org_school_student_time_idx" ON "StudentHealthEvent"("organizationId","schoolId","studentId","occurredAt");
CREATE INDEX "StudentHealthEvent_org_school_type_time_idx" ON "StudentHealthEvent"("organizationId","schoolId","eventType","occurredAt");
