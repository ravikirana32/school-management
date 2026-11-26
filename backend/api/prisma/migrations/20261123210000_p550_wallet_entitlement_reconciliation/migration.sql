CREATE TABLE "CanteenStudentWallet" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "currency" VARCHAR(191) NOT NULL DEFAULT 'INR',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "CanteenStudentWallet_org_school_student_key"
  ON "CanteenStudentWallet"("organizationId","schoolId","studentId");

CREATE TABLE "CanteenWalletTransaction" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "walletId" VARCHAR(191) NOT NULL,
  "type" VARCHAR(191) NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "balanceAfter" DECIMAL(12,2) NOT NULL,
  "referenceType" VARCHAR(191),
  "referenceId" VARCHAR(191),
  "idempotencyKey" VARCHAR(191),
  "note" VARCHAR(191),
  "createdBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CanteenWalletTransaction_wallet_fkey"
    FOREIGN KEY ("walletId") REFERENCES "CanteenStudentWallet"("id") ON DELETE CASCADE
);

CREATE TABLE "CanteenMealEntitlement" (
  "id" VARCHAR(191) PRIMARY KEY,
  "organizationId" VARCHAR(191) NOT NULL,
  "schoolId" VARCHAR(191) NOT NULL,
  "studentId" VARCHAR(191) NOT NULL,
  "entitlementName" VARCHAR(191) NOT NULL DEFAULT 'Meal entitlement',
  "totalMeals" INTEGER NOT NULL,
  "consumedMeals" INTEGER NOT NULL DEFAULT 0,
  "validFrom" DATE NOT NULL,
  "validTo" DATE,
  "status" VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  "createdBy" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
