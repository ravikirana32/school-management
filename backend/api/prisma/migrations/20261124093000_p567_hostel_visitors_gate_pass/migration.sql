-- P567: Hostel visitor registration, approved visitor access and resident outpasses.
CREATE TABLE "HostelVisitorVisit" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "allocationId" TEXT NOT NULL,
  "buildingId" TEXT NOT NULL,
  "visitorName" VARCHAR(120) NOT NULL,
  "visitorPhone" VARCHAR(30),
  "identityType" VARCHAR(40),
  "identityLast4" VARCHAR(4),
  "purpose" VARCHAR(500) NOT NULL,
  "status" VARCHAR(24) NOT NULL DEFAULT 'PENDING',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "decisionNote" VARCHAR(500),
  "checkedInAt" TIMESTAMP(3),
  "checkedInBy" TEXT,
  "checkedOutAt" TIMESTAMP(3),
  "checkedOutBy" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HostelVisitorVisit_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "HostelGatePass" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "passType" VARCHAR(24) NOT NULL,
  "visitorVisitId" TEXT,
  "allocationId" TEXT NOT NULL,
  "leaveRequestId" TEXT,
  "passCode" VARCHAR(64) NOT NULL,
  "purpose" VARCHAR(500) NOT NULL,
  "validFrom" TIMESTAMP(3) NOT NULL,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "status" VARCHAR(24) NOT NULL DEFAULT 'PENDING',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "decisionNote" VARCHAR(500),
  "departedAt" TIMESTAMP(3),
  "departedBy" TEXT,
  "returnedAt" TIMESTAMP(3),
  "returnedBy" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HostelGatePass_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HostelGatePass_visitorVisitId_key" ON "HostelGatePass"("visitorVisitId");
CREATE UNIQUE INDEX "HostelGatePass_passCode_key" ON "HostelGatePass"("passCode");
CREATE INDEX "HostelVisitorVisit_org_school_status_requested_idx" ON "HostelVisitorVisit"("organizationId","schoolId","status","requestedAt");
CREATE INDEX "HostelVisitorVisit_org_school_allocation_idx" ON "HostelVisitorVisit"("organizationId","schoolId","allocationId","requestedAt");
CREATE INDEX "HostelVisitorVisit_building_status_idx" ON "HostelVisitorVisit"("buildingId","status");
CREATE INDEX "HostelGatePass_org_school_status_window_idx" ON "HostelGatePass"("organizationId","schoolId","status","validFrom","validUntil");
CREATE INDEX "HostelGatePass_org_school_allocation_idx" ON "HostelGatePass"("organizationId","schoolId","allocationId","createdAt");
CREATE INDEX "HostelGatePass_leaveRequestId_idx" ON "HostelGatePass"("leaveRequestId");
ALTER TABLE "HostelGatePass" ADD CONSTRAINT "HostelGatePass_visitorVisitId_fkey" FOREIGN KEY ("visitorVisitId") REFERENCES "HostelVisitorVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
