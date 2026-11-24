-- P70 acceptance: execute after all migrations using a privileged migration/inspection role.
-- Every table carrying organizationId or schoolId must have RLS enabled, forced, and at
-- least one policy. This is a catalog audit; it does not replace non-owner behavioral tests.
DO $$
DECLARE
  missing RECORD;
  missing_count INTEGER := 0;
BEGIN
  FOR missing IN
    SELECT c.relname AS table_name,
           c.relrowsecurity AS rls_enabled,
           c.relforcerowsecurity AS rls_forced,
           (SELECT COUNT(*) FROM pg_policies p
             WHERE p.schemaname = n.nspname AND p.tablename = c.relname) AS policy_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = current_schema()
       AND c.relkind = 'r'
       AND EXISTS (
         SELECT 1 FROM information_schema.columns col
          WHERE col.table_schema = n.nspname
            AND col.table_name = c.relname
            AND col.column_name IN ('organizationId', 'schoolId')
       )
       AND (NOT c.relrowsecurity OR NOT c.relforcerowsecurity OR NOT EXISTS (
         SELECT 1 FROM pg_policies p
          WHERE p.schemaname = n.nspname AND p.tablename = c.relname
       ))
     ORDER BY c.relname
  LOOP
    RAISE WARNING 'Tenant RLS gap: table=%, enabled=%, forced=%, policies=%',
      missing.table_name, missing.rls_enabled, missing.rls_forced, missing.policy_count;
    missing_count := missing_count + 1;
  END LOOP;

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'P70 tenant RLS catalog acceptance failed: % tenant-scoped tables lack forced RLS/policy coverage', missing_count;
  END IF;
END $$;

-- Deployment role posture: application role must not be superuser or BYPASSRLS.
-- Set p70.application_role to the actual deployment role before running this block.
DO $$
DECLARE
  role_name TEXT := current_setting('p70.application_role', true);
  is_super BOOLEAN;
  bypass_rls BOOLEAN;
BEGIN
  IF role_name IS NULL OR role_name = '' THEN
    RAISE EXCEPTION 'Set p70.application_role to the actual application database role';
  END IF;
  SELECT rolsuper, rolbypassrls INTO is_super, bypass_rls FROM pg_roles WHERE rolname = role_name;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application role % does not exist', role_name; END IF;
  IF is_super OR bypass_rls THEN
    RAISE EXCEPTION 'Application role % is unsafe: superuser=%, bypassrls=%', role_name, is_super, bypass_rls;
  END IF;
END $$;
