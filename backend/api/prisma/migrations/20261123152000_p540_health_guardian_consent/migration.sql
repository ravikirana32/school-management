CREATE TABLE "StudentHealthConsent" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "guardianId" VARCHAR(191) NOT NULL,
  "grantedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "consentVersion" VARCHAR(191) NOT NULL DEFAULT 'health-visibility-v1',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "StudentHealthConsent_scope_student_guardian_key"
  ON "StudentHealthConsent"("organizationId","schoolId","studentId","guardianId");
CREATE INDEX "StudentHealthConsent_scope_guardian_revoked_idx"
  ON "StudentHealthConsent"("organizationId","schoolId","guardianId","revokedAt");
CREATE INDEX "StudentHealthConsent_scope_student_revoked_idx"
  ON "StudentHealthConsent"("organizationId","schoolId","studentId","revokedAt");
