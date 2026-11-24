-- P569: hostel bed transfers, prioritized waitlist and auditable checkout settlement.
CREATE TABLE "HostelBedTransfer" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "allocationId" TEXT NOT NULL, "studentId" TEXT NOT NULL, "fromBedId" TEXT NOT NULL,
 "toBedId" TEXT NOT NULL, "effectiveAt" TIMESTAMP(3) NOT NULL, "reason" VARCHAR(1000) NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'COMPLETED', "requestedBy" TEXT NOT NULL, "approvedBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "HostelBedTransfer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HostelBedTransfer_org_school_student_created_idx" ON "HostelBedTransfer"("organizationId","schoolId","studentId","createdAt");
CREATE INDEX "HostelBedTransfer_org_school_allocation_status_idx" ON "HostelBedTransfer"("organizationId","schoolId","allocationId","status");
CREATE TABLE "HostelWaitlistEntry" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "studentId" TEXT NOT NULL,
 "academicYear" VARCHAR(30) NOT NULL, "requestedHostelType" TEXT NOT NULL DEFAULT 'ANY', "preferredBuildingId" TEXT,
 "priority" INTEGER NOT NULL DEFAULT 100, "eligibilityStatus" TEXT NOT NULL DEFAULT 'PENDING', "status" TEXT NOT NULL DEFAULT 'WAITLISTED',
 "guardianContactConsent" BOOLEAN NOT NULL DEFAULT FALSE, "offeredBedId" TEXT, "offeredAt" TIMESTAMP(3),
 "offerExpiresAt" TIMESTAMP(3), "acceptedAt" TIMESTAMP(3), "declinedAt" TIMESTAMP(3), "createdBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "HostelWaitlistEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HostelWaitlistEntry_org_school_student_year_key" ON "HostelWaitlistEntry"("organizationId","schoolId","studentId","academicYear");
CREATE INDEX "HostelWaitlistEntry_org_school_status_priority_created_idx" ON "HostelWaitlistEntry"("organizationId","schoolId","status","priority","createdAt");
CREATE TABLE "HostelCheckout" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "allocationId" TEXT NOT NULL,
 "studentId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS', "keysReturned" BOOLEAN NOT NULL DEFAULT FALSE,
 "inventoryCleared" BOOLEAN NOT NULL DEFAULT FALSE, "damageAssessed" BOOLEAN NOT NULL DEFAULT FALSE, "duesCleared" BOOLEAN NOT NULL DEFAULT FALSE,
 "depositReviewed" BOOLEAN NOT NULL DEFAULT FALSE, "notes" VARCHAR(2000), "requestedBy" TEXT NOT NULL, "approvedBy" TEXT,
 "approvedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "HostelCheckout_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HostelCheckout_org_school_allocation_key" ON "HostelCheckout"("organizationId","schoolId","allocationId");
CREATE UNIQUE INDEX "HostelCheckout_id_org_school_key" ON "HostelCheckout"("id","organizationId","schoolId");
CREATE INDEX "HostelCheckout_org_school_status_created_idx" ON "HostelCheckout"("organizationId","schoolId","status","createdAt");
CREATE TABLE "HostelSettlementLine" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "checkoutId" TEXT NOT NULL,
 "lineType" TEXT NOT NULL, "description" VARCHAR(500) NOT NULL, "amount" DECIMAL(12,2) NOT NULL,
 "direction" TEXT NOT NULL, "approved" BOOLEAN NOT NULL DEFAULT FALSE, "approvedBy" TEXT, "approvedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "HostelSettlementLine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HostelSettlementLine_org_school_checkout_created_idx" ON "HostelSettlementLine"("organizationId","schoolId","checkoutId","createdAt");
ALTER TABLE "HostelSettlementLine" ADD CONSTRAINT "HostelSettlementLine_checkout_fkey"
 FOREIGN KEY ("checkoutId","organizationId","schoolId") REFERENCES "HostelCheckout"("id","organizationId","schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Composite ownership keys for scoped record references.
CREATE UNIQUE INDEX "HostelBuilding_id_org_school_key" ON "HostelBuilding"("id","organizationId","schoolId");
CREATE UNIQUE INDEX "HostelBed_id_org_school_key" ON "HostelBed"("id","organizationId","schoolId");
CREATE UNIQUE INDEX "HostelAllocation_id_org_school_key" ON "HostelAllocation"("id","organizationId","schoolId");
