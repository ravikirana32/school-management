-- Run manually against a migrated PostgreSQL database using the same non-owner role
-- configured for the API. Seed organization/school rows before executing.
-- The test harness must SET LOCAL values within a transaction, then verify a second
-- tenant's rows are invisible and writes to that tenant are rejected.
BEGIN;
SELECT set_config('app.current_organization_id', 'replace-with-org-a-id', true);
SELECT set_config('app.current_school_id', '', true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "School" WHERE "organizationId" <> current_setting('app.current_organization_id', true)) THEN
    RAISE EXCEPTION 'RLS failure: cross-organization school row is visible';
  END IF;
END $$;
ROLLBACK;

-- Negative test: no tenant context must return zero protected rows.
BEGIN;
SELECT set_config('app.current_organization_id', '', true);
SELECT set_config('app.current_school_id', '', true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "School") THEN
    RAISE EXCEPTION 'RLS failure: school rows visible without tenant context';
  END IF;
END $$;
ROLLBACK;
