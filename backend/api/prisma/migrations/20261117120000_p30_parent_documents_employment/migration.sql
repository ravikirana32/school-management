BEGIN;

-- P30: verified guardian contact/account linkage, private document scan state,
-- invitation scope lookup, and non-overlapping employment periods.

ALTER TABLE "Guardian"
  ADD COLUMN "userId" TEXT,
  ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "mergedIntoGuardianId" TEXT;
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_user_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL;
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_merged_into_school_fkey"
  FOREIGN KEY ("mergedIntoGuardianId", "organizationId", "schoolId")
  REFERENCES "Guardian"("id", "organizationId", "schoolId") ON DELETE RESTRICT;
CREATE INDEX "Guardian_userId_idx" ON "Guardian"("userId");

CREATE TYPE "ParentInvitationStatus" AS ENUM ('PENDING','ACCEPTED','REVOKED','EXPIRED');
CREATE TABLE "ParentInvitation" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "guardianId" TEXT NOT NULL,
  "invitedEmail" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "consentVersion" TEXT NOT NULL,
  "consentAcceptedAt" TIMESTAMP(3),
  "status" "ParentInvitationStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "acceptedByUserId" TEXT,
  "createdBy" TEXT NOT NULL,
  "deliveryCiphertext" TEXT NOT NULL,
  "deliveryNonce" TEXT NOT NULL,
  "deliveryTag" TEXT NOT NULL,
  "deliveryStatus" TEXT NOT NULL DEFAULT 'QUEUED',
  "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ParentInvitation_guardian_school_fkey"
    FOREIGN KEY ("guardianId", "organizationId", "schoolId")
    REFERENCES "Guardian"("id", "organizationId", "schoolId") ON DELETE CASCADE,
  CONSTRAINT "ParentInvitation_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "ParentInvitation_acceptor_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE INDEX "ParentInvitation_scope_guardian_status_idx" ON "ParentInvitation"("organizationId","schoolId","guardianId","status");
CREATE INDEX "ParentInvitation_expiry_status_idx" ON "ParentInvitation"("expiresAt","status");
CREATE UNIQUE INDEX "ParentInvitation_one_pending_per_guardian_idx" ON "ParentInvitation"("guardianId") WHERE "status"='PENDING';
ALTER TABLE "ParentInvitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ParentInvitation" FORCE ROW LEVEL SECURITY;
CREATE POLICY "parent_invitation_school_tenant_isolation" ON "ParentInvitation"
  USING ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true))
  WITH CHECK ("organizationId" = current_setting('app.current_organization_id',true) AND "schoolId" = current_setting('app.current_school_id',true));

CREATE TYPE "DocumentSecurityStatus" AS ENUM ('PENDING_UPLOAD','QUARANTINED','CLEAN','REJECTED');
ALTER TABLE "StudentDocument" ADD COLUMN "securityStatus" "DocumentSecurityStatus" NOT NULL DEFAULT 'PENDING_UPLOAD';
ALTER TABLE "StaffDocument" ADD COLUMN "securityStatus" "DocumentSecurityStatus" NOT NULL DEFAULT 'PENDING_UPLOAD';
CREATE INDEX "StudentDocument_security_status_idx" ON "StudentDocument"("organizationId","schoolId","securityStatus");
CREATE INDEX "StaffDocument_security_status_idx" ON "StaffDocument"("organizationId","schoolId","securityStatus");

-- Narrow SELECT-only RLS exceptions for possession-based invitation lookup and signed scanner callbacks.
-- They reveal only the matching record's tenant scope; all subsequent access re-enters tenant context.
CREATE POLICY "parent_invitation_token_lookup" ON "ParentInvitation" FOR SELECT
  USING ("tokenHash" = current_setting('app.parent_invitation_token_hash', true));
CREATE POLICY "student_document_scanner_lookup" ON "StudentDocument" FOR SELECT
  USING ("id" = current_setting('app.document_scan_id', true)
     AND "objectKey" = current_setting('app.document_scan_object_key', true)
     AND "securityStatus" = 'QUARANTINED');
CREATE POLICY "staff_document_scanner_lookup" ON "StaffDocument" FOR SELECT
  USING ("id" = current_setting('app.document_scan_id', true)
     AND "objectKey" = current_setting('app.document_scan_object_key', true)
     AND "securityStatus" = 'QUARANTINED');

-- Abort rather than silently rewriting overlapping employment history.
CREATE EXTENSION IF NOT EXISTS btree_gist;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "StaffEmploymentHistory" WHERE "endsOn" IS NOT NULL AND "endsOn" < "startsOn") THEN
    RAISE EXCEPTION 'P30 preflight failed: invalid staff employment date range exists; review and remediate before applying exclusion constraint';
  END IF;
  IF EXISTS (
    SELECT 1 FROM "StaffEmploymentHistory" a
    JOIN "StaffEmploymentHistory" b
      ON a."staffMemberId"=b."staffMemberId" AND a."id" < b."id"
     AND daterange(a."startsOn", COALESCE(a."endsOn", 'infinity'::date), '[]')
         && daterange(b."startsOn", COALESCE(b."endsOn", 'infinity'::date), '[]')
  ) THEN
    RAISE EXCEPTION 'P30 preflight failed: overlapping staff employment history exists; review and remediate before applying exclusion constraint';
  END IF;
END $$;
ALTER TABLE "StaffEmploymentHistory" ADD CONSTRAINT "StaffEmploymentHistory_dates_check" CHECK ("endsOn" IS NULL OR "endsOn" >= "startsOn");
ALTER TABLE "StaffEmploymentHistory"
  ADD CONSTRAINT "StaffEmploymentHistory_no_overlap_excl"
  EXCLUDE USING gist (
    "staffMemberId" WITH =,
    daterange("startsOn", COALESCE("endsOn", 'infinity'::date), '[]') WITH &&
  );

COMMIT;
