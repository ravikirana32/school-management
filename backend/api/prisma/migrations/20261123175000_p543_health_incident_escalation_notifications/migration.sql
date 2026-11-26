CREATE TABLE "StudentHealthIncident" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "caseId" VARCHAR(191),
  "incidentType" VARCHAR(40) NOT NULL,
  "severity" VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  "title" VARCHAR(180) NOT NULL,
  "description" TEXT,
  "status" VARCHAR(24) NOT NULL DEFAULT 'OPEN',
  "escalationLevel" INTEGER NOT NULL DEFAULT 0,
  "assignedToUserId" VARCHAR(191),
  "reportedByUserId" VARCHAR(191) NOT NULL,
  "acknowledgedByUserId" VARCHAR(191),
  "acknowledgedAt" TIMESTAMP(3),
  "escalatedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentHealthIncident_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "StudentHealthIncident_student_scope_fk" FOREIGN KEY ("studentId","organizationId","schoolId")
    REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "StudentHealthIncident_case_scope_fk" FOREIGN KEY ("caseId","organizationId","schoolId")
    REFERENCES "StudentHealthCase"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE TABLE "StudentHealthIncidentNotification" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "incidentId" VARCHAR(191) NOT NULL,
  "guardianId" VARCHAR(191) NOT NULL,
  "channel" VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
  "status" VARCHAR(24) NOT NULL DEFAULT 'QUEUED',
  "eventType" VARCHAR(40) NOT NULL DEFAULT 'HEALTH_INCIDENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentHealthIncidentNotification_incident_guardian_event_key"
    UNIQUE ("incidentId","guardianId","eventType"),
  CONSTRAINT "StudentHealthIncidentNotification_incident_scope_fk"
    FOREIGN KEY ("incidentId","organizationId","schoolId")
    REFERENCES "StudentHealthIncident"("id","organizationId","schoolId") ON DELETE CASCADE
);
