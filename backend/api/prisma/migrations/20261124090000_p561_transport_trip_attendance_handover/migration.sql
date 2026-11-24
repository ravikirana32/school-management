CREATE TABLE "TransportTripAttendance" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "tripId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "routeId" TEXT NOT NULL,
  "stopId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "recordedBy" TEXT NOT NULL,
  "notes" TEXT,
  "handoverTo" TEXT,
  CONSTRAINT "TransportTripAttendance_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TransportTripAttendance_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "TransportTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TransportTripAttendance_tripId_studentId_stopId_key" ON "TransportTripAttendance"("tripId","studentId","stopId");
CREATE INDEX "TransportTripAttendance_organizationId_schoolId_tripId_status_idx" ON "TransportTripAttendance"("organizationId","schoolId","tripId","status");
CREATE INDEX "TransportTripAttendance_organizationId_schoolId_studentId_recordedAt_idx" ON "TransportTripAttendance"("organizationId","schoolId","studentId","recordedAt");
