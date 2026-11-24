-- P48: versioned HMAC hashes support safe overlap during key rotation.
-- Existing hashes remain v1; no plaintext email exists to recompute them.
ALTER TABLE "NotificationEmailSuppression" ADD COLUMN "hashVersion" VARCHAR(20) NOT NULL DEFAULT 'v1';
CREATE INDEX "NotificationEmailSuppression_org_school_version_hash_status_idx" ON "NotificationEmailSuppression"("organizationId", "schoolId", "hashVersion", "emailHash", "status");
