# P46 migration

Adds school-scoped email suppression using HMAC-SHA256 hashes, active unique constraint, audit history and forced RLS. Configure `NOTIFICATION_SUPPRESSION_HASH_SECRET` with a stable 32+ character secret in API and worker environments. Do not rotate without a controlled rehash migration.
