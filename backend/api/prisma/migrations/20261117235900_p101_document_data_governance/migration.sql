BEGIN;

-- P101: document and data governance foundations.
CREATE TYPE "GovernanceRequestType" AS ENUM ('ACCESS','EXPORT','ERASURE','CORRECTION');
CREATE TYPE "GovernanceRequestStatus" AS ENUM ('REQUESTED','UNDER_REVIEW','APPROVED','REJECTED','COMPLETED');

CREATE TABLE "DataGovernanceRequest" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "requestType" "GovernanceRequestType" NOT NULL,
  "subjectType" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "requesterName" TEXT NOT NULL,
  "requesterEmail" TEXT,
  "relationship" TEXT,
  "reason" TEXT,
  "status" "GovernanceRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "resolutionNotes" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DataGovernanceRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DataGovernanceRequest_org_school_status_requested_idx" ON "DataGovernanceRequest"("organizationId","schoolId","status","requestedAt");
CREATE INDEX "DataGovernanceRequest_org_school_subject_idx" ON "DataGovernanceRequest"("organizationId","schoolId","subjectType","subjectId");

CREATE TABLE "DocumentLegalHold" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "authorityReference" TEXT,
  "placedBy" TEXT NOT NULL,
  "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedBy" TEXT,
  "releasedAt" TIMESTAMP(3),
  "releaseReason" TEXT,
  CONSTRAINT "DocumentLegalHold_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DocumentLegalHold_org_school_target_release_idx" ON "DocumentLegalHold"("organizationId","schoolId","targetType","targetId","releasedAt");

CREATE TABLE "DocumentRetentionPolicy" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "recordType" TEXT NOT NULL,
  "retentionDays" INTEGER NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DocumentRetentionPolicy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DocumentRetentionPolicy_school_recordType_key" ON "DocumentRetentionPolicy"("schoolId","recordType");
CREATE INDEX "DocumentRetentionPolicy_org_school_enabled_idx" ON "DocumentRetentionPolicy"("organizationId","schoolId","enabled");

ALTER TABLE "DataGovernanceRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataGovernanceRequest" FORCE ROW LEVEL SECURITY;
CREATE POLICY "data_governance_request_tenant_isolation" ON "DataGovernanceRequest"
  USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));
ALTER TABLE "DocumentLegalHold" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentLegalHold" FORCE ROW LEVEL SECURITY;
CREATE POLICY "document_legal_hold_tenant_isolation" ON "DocumentLegalHold"
  USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));
ALTER TABLE "DocumentRetentionPolicy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentRetentionPolicy" FORCE ROW LEVEL SECURITY;
CREATE POLICY "document_retention_policy_tenant_isolation" ON "DocumentRetentionPolicy"
  USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));
ALTER TABLE "DocumentRetentionPolicy" ADD CONSTRAINT "DocumentRetentionPolicy_retentionDays_check" CHECK ("retentionDays" BETWEEN 1 AND 36500);

CREATE TYPE "DataConsentEventType" AS ENUM ('ACCEPTED','WITHDRAWN');
CREATE TABLE "DataConsentEvent" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "guardianId" TEXT NOT NULL,
  "invitationId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "eventType" "DataConsentEventType" NOT NULL,
  "consentVersion" TEXT NOT NULL,
  "noticeSnapshot" VARCHAR(4000) NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DataConsentEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DataConsentEvent_org_school_guardian_occurred_idx" ON "DataConsentEvent"("organizationId","schoolId","guardianId","occurredAt");
CREATE INDEX "DataConsentEvent_org_school_invitation_occurred_idx" ON "DataConsentEvent"("organizationId","schoolId","invitationId","occurredAt");
ALTER TABLE "DataConsentEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataConsentEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY "data_consent_event_tenant_isolation" ON "DataConsentEvent"
  USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));

COMMIT;
