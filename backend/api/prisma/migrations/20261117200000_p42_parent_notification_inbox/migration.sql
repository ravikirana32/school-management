-- P42: keyset inbox pagination for a parent within one school and recipient.
-- The index supports the exact descending (createdAt,id) order used by the API.
CREATE INDEX IF NOT EXISTS "ParentNotification_recipient_created_id_desc_idx"
  ON "ParentNotification" ("organizationId", "schoolId", "recipientUserId", "createdAt" DESC, "id" DESC);
