-- P563: optional stop coordinates enable parent route visibility and geofence calculations.
ALTER TABLE "TransportStop" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,7);
ALTER TABLE "TransportStop" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10,7);
ALTER TABLE "TransportStop" ADD CONSTRAINT "TransportStop_lat_range_check" CHECK ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90));
ALTER TABLE "TransportStop" ADD CONSTRAINT "TransportStop_lon_range_check" CHECK ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180));
ALTER TABLE "TransportStop" ADD CONSTRAINT "TransportStop_coordinates_pair_check" CHECK (("latitude" IS NULL AND "longitude" IS NULL) OR ("latitude" IS NOT NULL AND "longitude" IS NOT NULL));
