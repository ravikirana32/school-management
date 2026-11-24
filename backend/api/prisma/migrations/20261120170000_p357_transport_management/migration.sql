CREATE TABLE "TransportVehicle" (
 "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,"registrationNumber" TEXT NOT NULL,"vehicleType" TEXT NOT NULL DEFAULT 'BUS',"capacity" INTEGER NOT NULL,"status" TEXT NOT NULL DEFAULT 'ACTIVE',"insuranceExpiry" TIMESTAMP(3),"permitExpiry" TIMESTAMP(3),"fitnessExpiry" TIMESTAMP(3),"notes" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "TransportVehicle_pkey" PRIMARY KEY("id"));
CREATE UNIQUE INDEX "TransportVehicle_org_school_registration_key" ON "TransportVehicle"("organizationId","schoolId","registrationNumber");
CREATE INDEX "TransportVehicle_org_school_status_idx" ON "TransportVehicle"("organizationId","schoolId","status");
CREATE TABLE "TransportRoute" (
 "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,"name" TEXT NOT NULL,"code" TEXT,"vehicleId" TEXT,"driverId" TEXT,"attendantId" TEXT,"startTime" TEXT NOT NULL,"endTime" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'ACTIVE',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "TransportRoute_pkey" PRIMARY KEY("id"));
CREATE INDEX "TransportRoute_org_school_status_idx" ON "TransportRoute"("organizationId","schoolId","status");
CREATE TABLE "TransportStop" (
 "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,"routeId" TEXT NOT NULL,"name" TEXT NOT NULL,"sequence" INTEGER NOT NULL,"pickupTime" TEXT,"dropTime" TEXT,"notes" TEXT,
 CONSTRAINT "TransportStop_pkey" PRIMARY KEY("id"),CONSTRAINT "TransportStop_routeId_fkey" FOREIGN KEY("routeId") REFERENCES "TransportRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE UNIQUE INDEX "TransportStop_routeId_sequence_key" ON "TransportStop"("routeId","sequence");CREATE INDEX "TransportStop_org_school_idx" ON "TransportStop"("organizationId","schoolId");
CREATE TABLE "TransportAllocation" (
 "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,"studentId" TEXT NOT NULL,"routeId" TEXT NOT NULL,"stopId" TEXT NOT NULL,"academicYear" TEXT NOT NULL,"monthlyFee" DECIMAL(10,2) NOT NULL DEFAULT 0,"status" TEXT NOT NULL DEFAULT 'ACTIVE',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "TransportAllocation_pkey" PRIMARY KEY("id"),CONSTRAINT "TransportAllocation_routeId_fkey" FOREIGN KEY("routeId") REFERENCES "TransportRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE UNIQUE INDEX "TransportAllocation_org_school_student_year_key" ON "TransportAllocation"("organizationId","schoolId","studentId","academicYear");CREATE INDEX "TransportAllocation_org_school_status_idx" ON "TransportAllocation"("organizationId","schoolId","status");
CREATE TABLE "TransportTrip" (
 "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,"routeId" TEXT NOT NULL,"vehicleId" TEXT NOT NULL,"tripDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"direction" TEXT NOT NULL DEFAULT 'PICKUP',"status" TEXT NOT NULL DEFAULT 'PLANNED',"startedAt" TIMESTAMP(3),"endedAt" TIMESTAMP(3),"notes" TEXT,
 CONSTRAINT "TransportTrip_pkey" PRIMARY KEY("id"),CONSTRAINT "TransportTrip_routeId_fkey" FOREIGN KEY("routeId") REFERENCES "TransportRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX "TransportTrip_org_school_date_idx" ON "TransportTrip"("organizationId","schoolId","tripDate");
CREATE TABLE "TransportTripEvent" (
 "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,"tripId" TEXT NOT NULL,"studentId" TEXT,"stopId" TEXT NOT NULL,"eventType" TEXT NOT NULL,"eventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"notes" TEXT,
 CONSTRAINT "TransportTripEvent_pkey" PRIMARY KEY("id"),CONSTRAINT "TransportTripEvent_tripId_fkey" FOREIGN KEY("tripId") REFERENCES "TransportTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX "TransportTripEvent_tripId_eventAt_idx" ON "TransportTripEvent"("tripId","eventAt");
