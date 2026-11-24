CREATE TABLE "TransportIncident" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "vehicleId" TEXT, "routeId" TEXT, "tripId" TEXT, "reportedBy" TEXT NOT NULL,
  "category" TEXT NOT NULL, "severity" TEXT NOT NULL DEFAULT 'MEDIUM', "status" TEXT NOT NULL DEFAULT 'OPEN',
  "title" TEXT NOT NULL, "description" TEXT, "location" TEXT, "emergencyContacted" BOOLEAN NOT NULL DEFAULT false,
  "emergencyContactName" TEXT, "resolutionNotes" TEXT, "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TransportIncident_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TransportIncident_org_school_status_severity_idx" ON "TransportIncident"("organizationId","schoolId","status","severity");
CREATE INDEX "TransportIncident_org_school_occurred_idx" ON "TransportIncident"("organizationId","schoolId","occurredAt");
CREATE TABLE "TransportMaintenance" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "vehicleId" TEXT NOT NULL,
  "maintenanceType" TEXT NOT NULL, "description" TEXT NOT NULL, "vendorName" TEXT, "cost" DECIMAL(10,2),
  "scheduledAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "nextDueAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED', "odometerKm" INTEGER, "notes" TEXT, "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TransportMaintenance_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TransportMaintenance_org_school_vehicle_status_idx" ON "TransportMaintenance"("organizationId","schoolId","vehicleId","status");
CREATE INDEX "TransportMaintenance_org_school_next_due_idx" ON "TransportMaintenance"("organizationId","schoolId","nextDueAt");
CREATE TABLE "TransportVehicleInspection" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "vehicleId" TEXT NOT NULL,
  "inspectedBy" TEXT NOT NULL, "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "result" TEXT NOT NULL,
  "defects" TEXT, "odometerKm" INTEGER, "followUpDueAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransportVehicleInspection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TransportVehicleInspection_org_school_vehicle_date_idx" ON "TransportVehicleInspection"("organizationId","schoolId","vehicleId","inspectionDate");
