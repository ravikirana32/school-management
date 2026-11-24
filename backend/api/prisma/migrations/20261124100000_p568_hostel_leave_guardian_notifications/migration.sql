-- P568: hostel leave lifecycle, guardian consent, notification events and approved outpass linkage.
ALTER TABLE "HostelLeaveRequest"
  ALTER COLUMN "status" TYPE VARCHAR(24),
  ADD COLUMN "allocationId" TEXT,
  ADD COLUMN "destination" VARCHAR(240),
  ADD COLUMN "contactNumber" VARCHAR(30),
  ADD COLUMN "createdBy" TEXT,
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "deniedBy" TEXT,
  ADD COLUMN "decisionNote" VARCHAR(1000),
  ADD COLUMN "deniedAt" TIMESTAMP(3),
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "cancelledBy" TEXT,
  ADD COLUMN "actualReturnAt" TIMESTAMP(3),
  ADD COLUMN "returnedBy" TEXT,
  ADD COLUMN "lateReturnAt" TIMESTAMP(3),
  ADD COLUMN "lateReturnNote" VARCHAR(1000),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "HostelLeaveRequest_org_school_student_departure_idx"
  ON "HostelLeaveRequest"("organizationId","schoolId","studentId","requestedDeparture");
CREATE INDEX "HostelLeaveRequest_org_school_return_status_idx"
  ON "HostelLeaveRequest"("organizationId","schoolId","expectedReturn","status");
CREATE UNIQUE INDEX "HostelLeaveRequest_id_org_school_key"
  ON "HostelLeaveRequest"("id","organizationId","schoolId");

-- Retain the existing non-unique lookup index; application-level advisory locking
-- and duplicate checks prevent a second pass without invalidating legacy records.
ALTER TABLE "HostelGatePass"
  ADD CONSTRAINT "HostelGatePass_leaveRequestId_fkey"
  FOREIGN KEY ("leaveRequestId") REFERENCES "HostelLeaveRequest"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "HostelGuardianConsent" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "guardianId" TEXT NOT NULL,
  "leaveUpdatesEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "inAppEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "emailEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "consentVersion" VARCHAR(40) NOT NULL DEFAULT 'hostel-leave-v1',
  "grantedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HostelGuardianConsent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HostelGuardianConsent_org_school_student_guardian_key"
  ON "HostelGuardianConsent"("organizationId","schoolId","studentId","guardianId");
CREATE INDEX "HostelGuardianConsent_org_school_guardian_enabled_idx"
  ON "HostelGuardianConsent"("organizationId","schoolId","guardianId","leaveUpdatesEnabled");
ALTER TABLE "HostelGuardianConsent"
  ADD CONSTRAINT "HostelGuardianConsent_student_fkey"
  FOREIGN KEY ("studentId","organizationId","schoolId")
  REFERENCES "Student"("id","organizationId","schoolId")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HostelGuardianConsent"
  ADD CONSTRAINT "HostelGuardianConsent_guardian_fkey"
  FOREIGN KEY ("guardianId","organizationId","schoolId")
  REFERENCES "Guardian"("id","organizationId","schoolId")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HostelLeaveNotificationEvent" (
  "id" TEXT NOT NULL,
  "eventKey" VARCHAR(240) NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "leaveRequestId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "guardianId" TEXT NOT NULL,
  "recipientUserId" TEXT NOT NULL,
  "eventType" VARCHAR(40) NOT NULL,
  "channel" VARCHAR(20) NOT NULL,
  "status" VARCHAR(24) NOT NULL DEFAULT 'QUEUED',
  "notificationOutboxId" TEXT,
  "lastError" VARCHAR(500),
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HostelLeaveNotificationEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HostelLeaveNotificationEvent_eventKey_key"
  ON "HostelLeaveNotificationEvent"("eventKey");
CREATE INDEX "HostelLeaveNotificationEvent_org_school_leave_created_idx"
  ON "HostelLeaveNotificationEvent"("organizationId","schoolId","leaveRequestId","createdAt");
CREATE INDEX "HostelLeaveNotificationEvent_org_school_guardian_status_idx"
  ON "HostelLeaveNotificationEvent"("organizationId","schoolId","guardianId","status");
CREATE INDEX "HostelLeaveNotificationEvent_outbox_idx"
  ON "HostelLeaveNotificationEvent"("notificationOutboxId");
ALTER TABLE "HostelLeaveNotificationEvent"
  ADD CONSTRAINT "HostelLeaveNotificationEvent_leaveRequest_fkey"
  FOREIGN KEY ("leaveRequestId","organizationId","schoolId")
  REFERENCES "HostelLeaveRequest"("id","organizationId","schoolId")
  ON DELETE CASCADE ON UPDATE CASCADE;


-- P568 adds guardian-initiated hostel leave requests and consent management.
INSERT INTO "Permission" ("id","key","module","action","description","createdAt")
VALUES ('p568-parent-hostel-manage','parent.hostel.manage','parent.hostel','manage','Create, edit and cancel linked student hostel leave requests and manage hostel leave notification consent',CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET "module"='parent.hostel',"action"='manage',
"description"='Create, edit and cancel linked student hostel leave requests and manage hostel leave notification consent';

INSERT INTO "RolePermission" ("id","roleId","permissionId","createdAt")
SELECT 'p568-parent-hostel-manage:' || r."id",r."id",p."id",CURRENT_TIMESTAMP
FROM "Role" r CROSS JOIN "Permission" p
WHERE r."key"='PARENT' AND p."key"='parent.hostel.manage'
ON CONFLICT ("roleId","permissionId") DO NOTHING;
