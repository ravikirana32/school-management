CREATE TABLE "HostelAttendanceSession" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "buildingId" TEXT NOT NULL, "sessionDate" DATE NOT NULL, "sessionType" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'OPEN', "createdBy" TEXT NOT NULL, "closedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "HostelAttendanceSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HostelAttendanceSession_org_school_building_date_type_key"
 ON "HostelAttendanceSession"("organizationId","schoolId","buildingId","sessionDate","sessionType");
CREATE INDEX "HostelAttendanceSession_org_school_date_status_idx"
 ON "HostelAttendanceSession"("organizationId","schoolId","sessionDate","status");
CREATE INDEX "HostelAttendanceSession_building_date_idx" ON "HostelAttendanceSession"("buildingId","sessionDate");

CREATE TABLE "HostelRollCallRecord" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "sessionId" TEXT NOT NULL, "allocationId" TEXT NOT NULL, "status" TEXT NOT NULL,
 "checkedAt" TIMESTAMP(3), "checkedBy" TEXT, "note" TEXT, "absenceVerifiedAt" TIMESTAMP(3),
 "absenceVerifiedBy" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "HostelRollCallRecord_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "HostelRollCallRecord_sessionId_fkey" FOREIGN KEY ("sessionId")
 REFERENCES "HostelAttendanceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HostelRollCallRecord_session_allocation_key" ON "HostelRollCallRecord"("sessionId","allocationId");
CREATE INDEX "HostelRollCallRecord_org_school_status_idx" ON "HostelRollCallRecord"("organizationId","schoolId","status");
CREATE INDEX "HostelRollCallRecord_allocation_created_idx" ON "HostelRollCallRecord"("allocationId","createdAt");

CREATE TABLE "HostelCurfewPolicy" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "buildingId" TEXT, "name" TEXT NOT NULL, "curfewTime" TEXT NOT NULL,
 "graceMinutes" INTEGER NOT NULL DEFAULT 0, "daysOfWeek" JSONB,
 "effectiveFrom" DATE NOT NULL, "effectiveTo" DATE, "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
 "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "HostelCurfewPolicy_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HostelCurfewPolicy_org_school_active_idx" ON "HostelCurfewPolicy"("organizationId","schoolId","isActive");
CREATE INDEX "HostelCurfewPolicy_building_active_idx" ON "HostelCurfewPolicy"("buildingId","isActive");

CREATE TABLE "HostelCurfewEvent" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "allocationId" TEXT NOT NULL, "policyId" TEXT, "expectedReturnAt" TIMESTAMP(3) NOT NULL,
 "actualReturnAt" TIMESTAMP(3), "minutesLate" INTEGER NOT NULL DEFAULT 0, "reason" TEXT,
 "status" TEXT NOT NULL DEFAULT 'OPEN', "recordedBy" TEXT NOT NULL, "resolvedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "HostelCurfewEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HostelCurfewEvent_org_school_status_expected_idx"
 ON "HostelCurfewEvent"("organizationId","schoolId","status","expectedReturnAt");
CREATE INDEX "HostelCurfewEvent_allocation_expected_idx" ON "HostelCurfewEvent"("allocationId","expectedReturnAt");

CREATE TABLE "HostelNightCheckRound" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "buildingId" TEXT NOT NULL, "scheduledAt" TIMESTAMP(3) NOT NULL, "startedAt" TIMESTAMP(3),
 "completedAt" TIMESTAMP(3), "status" TEXT NOT NULL DEFAULT 'SCHEDULED', "assignedTo" TEXT,
 "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "HostelNightCheckRound_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HostelNightCheckRound_org_school_status_scheduled_idx"
 ON "HostelNightCheckRound"("organizationId","schoolId","status","scheduledAt");
CREATE INDEX "HostelNightCheckRound_building_scheduled_idx" ON "HostelNightCheckRound"("buildingId","scheduledAt");

CREATE TABLE "HostelNightCheckEntry" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "roundId" TEXT NOT NULL, "allocationId" TEXT NOT NULL, "result" TEXT NOT NULL,
 "checkedAt" TIMESTAMP(3), "checkedBy" TEXT, "notes" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "HostelNightCheckEntry_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "HostelNightCheckEntry_roundId_fkey" FOREIGN KEY ("roundId")
 REFERENCES "HostelNightCheckRound"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HostelNightCheckEntry_round_allocation_key" ON "HostelNightCheckEntry"("roundId","allocationId");
CREATE INDEX "HostelNightCheckEntry_org_school_result_idx" ON "HostelNightCheckEntry"("organizationId","schoolId","result");
CREATE INDEX "HostelNightCheckEntry_allocation_checked_idx" ON "HostelNightCheckEntry"("allocationId","checkedAt");

CREATE TABLE "HostelSafetyEscalation" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "allocationId" TEXT NOT NULL, "sourceType" TEXT NOT NULL, "sourceId" TEXT,
 "severity" TEXT NOT NULL DEFAULT 'HIGH', "status" TEXT NOT NULL DEFAULT 'OPEN',
 "summary" TEXT NOT NULL, "assignedTo" TEXT, "createdBy" TEXT NOT NULL,
 "verifiedAt" TIMESTAMP(3), "resolvedAt" TIMESTAMP(3), "resolution" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "HostelSafetyEscalation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HostelSafetyEscalation_org_school_status_severity_idx"
 ON "HostelSafetyEscalation"("organizationId","schoolId","status","severity");
CREATE INDEX "HostelSafetyEscalation_allocation_created_idx" ON "HostelSafetyEscalation"("allocationId","createdAt");
