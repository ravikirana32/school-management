CREATE TABLE "MfaRecoveryCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MfaRecoveryCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MfaRecoveryCode_codeHash_key" ON "MfaRecoveryCode"("codeHash");
CREATE INDEX "MfaRecoveryCode_userId_usedAt_idx" ON "MfaRecoveryCode"("userId", "usedAt");

ALTER TABLE "MfaFactor" ADD COLUMN "lastTotpStep" BIGINT;
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "verifiedAt" DESC NULLS LAST, "createdAt" DESC, "id") AS position
  FROM "MfaFactor"
  WHERE "factorType" = 'TOTP' AND "disabledAt" IS NULL
)
UPDATE "MfaFactor" AS factor
SET "disabledAt" = CURRENT_TIMESTAMP
FROM ranked
WHERE factor."id" = ranked."id" AND ranked.position > 1;
CREATE UNIQUE INDEX "MfaFactor_one_active_totp_per_user" ON "MfaFactor"("userId") WHERE "factorType" = 'TOTP' AND "disabledAt" IS NULL;
