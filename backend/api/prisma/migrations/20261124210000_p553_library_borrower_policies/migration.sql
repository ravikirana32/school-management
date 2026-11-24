ALTER TABLE "LibraryLoan" ADD COLUMN IF NOT EXISTS "renewalCount" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS "LibraryBorrowerPolicy" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "borrowerType" TEXT NOT NULL,
  "loanDays" INTEGER NOT NULL DEFAULT 14, "maxActiveLoans" INTEGER NOT NULL DEFAULT 3, "maxRenewals" INTEGER NOT NULL DEFAULT 1,
  "renewalDays" INTEGER NOT NULL DEFAULT 7, "overdueFinePerDay" DECIMAL(10,2) NOT NULL DEFAULT 0, "allowRenewOverdue" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LibraryBorrowerPolicy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LibraryBorrowerPolicy_organizationId_schoolId_borrowerType_key" ON "LibraryBorrowerPolicy"("organizationId","schoolId","borrowerType");
CREATE INDEX IF NOT EXISTS "LibraryBorrowerPolicy_schoolId_borrowerType_idx" ON "LibraryBorrowerPolicy"("schoolId","borrowerType");
