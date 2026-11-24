-- P575 tenant isolation acceptance.
-- Execute after the complete migration chain using the actual restricted API database role.
-- Set p575.application_role to that role before execution. Do not run this acceptance as
-- the migration owner/superuser; the role-posture assertion is supplemental, not a substitute
-- for executing behavioral checks under the restricted role.

DO $$
DECLARE
  app_role TEXT := current_setting('p575.application_role', true);
  is_super BOOLEAN;
  bypass_rls BOOLEAN;
  missing RECORD;
  missing_count INTEGER := 0;
BEGIN
  IF app_role IS NULL OR app_role = '' THEN
    RAISE EXCEPTION 'Set p575.application_role to the actual API database role';
  END IF;
  SELECT rolsuper, rolbypassrls INTO is_super, bypass_rls
    FROM pg_roles WHERE rolname = app_role;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'P575 application role % does not exist', app_role;
  END IF;
  IF is_super OR bypass_rls THEN
    RAISE EXCEPTION 'P575 unsafe application role %: superuser=%, bypassrls=%', app_role, is_super, bypass_rls;
  END IF;

  FOR missing IN
    SELECT c.relname AS table_name,
           c.relrowsecurity AS rls_enabled,
           c.relforcerowsecurity AS rls_forced,
           COUNT(p.policyname) AS policy_count,
           BOOL_OR(COALESCE(p.qual, '') ~* 'app\.current_(organization|school)_id') AS has_tenant_using,
           BOOL_OR(COALESCE(p.with_check, '') ~* 'app\.current_(organization|school)_id') AS has_tenant_check
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_policies p ON p.schemaname = n.nspname AND p.tablename = c.relname
     WHERE n.nspname = current_schema()
       AND c.relkind IN ('r', 'p')
       AND EXISTS (
         SELECT 1 FROM information_schema.columns col
          WHERE col.table_schema = n.nspname
            AND col.table_name = c.relname
            AND col.column_name IN ('organizationId', 'schoolId')
       )
     GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
    HAVING NOT c.relrowsecurity
        OR NOT c.relforcerowsecurity
        OR COUNT(p.policyname) = 0
        OR NOT COALESCE(BOOL_OR(COALESCE(p.qual, '') ~* 'app\.current_(organization|school)_id'), FALSE)
        OR NOT COALESCE(BOOL_OR(COALESCE(p.with_check, '') ~* 'app\.current_(organization|school)_id'), FALSE)
     ORDER BY c.relname
  LOOP
    RAISE WARNING 'P575 RLS catalog gap: table=%, enabled=%, forced=%, policies=%, tenant_using=%, tenant_check=%',
      missing.table_name, missing.rls_enabled, missing.rls_forced, missing.policy_count,
      missing.has_tenant_using, missing.has_tenant_check;
    missing_count := missing_count + 1;
  END LOOP;

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'P575 RLS catalog acceptance failed: % tenant tables have incomplete RLS coverage', missing_count;
  END IF;
END $$;

-- Behavioral fail-closed check. This statement must execute as the restricted application role.
-- If the migrated database has tenant data, no tenant-owned row may be visible without context.
BEGIN;
SELECT set_config('app.current_organization_id', '', true);
SELECT set_config('app.current_school_id', '', true);
SELECT set_config('app.current_user_id', '', true);
SELECT set_config('app.is_platform_admin', 'false', true);
SELECT set_config('app.parent_delivery_worker', 'false', true);
SELECT set_config('app.document_scan_worker', 'false', true);
SELECT set_config('app.notification_worker', 'false', true);
SELECT set_config('app.report_card_verification', 'false', true);
DO $$
DECLARE
  tenant_table RECORD;
  visible_rows BIGINT;
BEGIN
  FOR tenant_table IN
    SELECT c.relname AS table_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = current_schema()
       AND c.relkind IN ('r', 'p')
       AND EXISTS (
         SELECT 1 FROM information_schema.columns col
          WHERE col.table_schema = n.nspname
            AND col.table_name = c.relname
            AND col.column_name IN ('organizationId', 'schoolId')
       )
     ORDER BY c.relname
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', tenant_table.table_name) INTO visible_rows;
    IF visible_rows > 0 THEN
      RAISE EXCEPTION 'P575 fail-closed violation: % tenant rows visible without tenant context in table %',
        visible_rows, tenant_table.table_name;
    END IF;
  END LOOP;
END $$;
ROLLBACK;

-- Cross-organization and cross-school negative fixtures must be added to the integration suite
-- for each API resource family. The catalog and no-context checks above do not replace those
-- fixture-backed behavioral tests or pooled-connection reuse tests.
