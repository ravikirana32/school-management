-- P367: tenant-scoped lookup index for transport trip event queries.
CREATE INDEX IF NOT EXISTS "TransportTripEvent_organizationId_schoolId_tripId_eventAt_idx"
ON "TransportTripEvent" ("organizationId", "schoolId", "tripId", "eventAt");
