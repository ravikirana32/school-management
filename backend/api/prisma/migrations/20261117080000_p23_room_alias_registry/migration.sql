-- P23 reviewed legacy room-label aliases. Mapping is explicit and school-scoped.
CREATE TABLE "SchoolRoomAlias" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "aliasLabel" VARCHAR(100) NOT NULL,
  "normalizedLabel" VARCHAR(100) NOT NULL,
  "canonicalRoomCode" VARCHAR(30) NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'APPROVED',
  "createdBy" TEXT NOT NULL,
  "approvedBy" TEXT,
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolRoomAlias_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SchoolRoomAlias_status_check" CHECK ("status" IN ('PENDING','APPROVED','APPLIED')),
  CONSTRAINT "SchoolRoomAlias_school_fkey" FOREIGN KEY ("schoolId", "organizationId") REFERENCES "School"("id", "organizationId") ON DELETE CASCADE,
  CONSTRAINT "SchoolRoomAlias_room_fkey" FOREIGN KEY ("schoolId", "canonicalRoomCode") REFERENCES "SchoolRoom"("schoolId", "code") ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT "SchoolRoomAlias_school_normalized_key" UNIQUE ("schoolId", "normalizedLabel"),
  CONSTRAINT "SchoolRoomAlias_id_org_school_key" UNIQUE ("id", "organizationId", "schoolId")
);
CREATE INDEX "SchoolRoomAlias_org_school_status_idx" ON "SchoolRoomAlias"("organizationId", "schoolId", "status");
ALTER TABLE "SchoolRoomAlias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolRoomAlias" FORCE ROW LEVEL SECURITY;
CREATE POLICY "School_room_alias_tenant_isolation" ON "SchoolRoomAlias"
 USING ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true))
 WITH CHECK ("organizationId" = current_setting('app.current_organization_id', true) AND "schoolId" = current_setting('app.current_school_id', true));
