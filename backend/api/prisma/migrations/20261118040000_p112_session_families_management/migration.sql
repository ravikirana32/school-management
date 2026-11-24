-- P112: refresh-token family tracking and authenticated session inventory/revocation.
ALTER TABLE "UserSession" ADD COLUMN "tokenFamilyId" TEXT;
CREATE INDEX "UserSession_tokenFamilyId_status_idx" ON "UserSession"("tokenFamilyId", "status");
-- Existing sessions remain valid; their family is initialized lazily on first rotation.
