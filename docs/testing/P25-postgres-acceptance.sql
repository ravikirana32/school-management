-- P25 PostgreSQL acceptance checklist / executable catalog checks.
-- Run with psql against a migrated test database as an operator with catalog read access.
-- Functional overlap tests require the tenant fixture IDs documented below.

DO $$
DECLARE
  required_trigger TEXT;
BEGIN
  FOREACH required_trigger IN ARRAY ARRAY[
    'teacher_timetable_slot_overlap_guard_trigger',
    'teacher_timetable_exception_overlap_guard_trigger',
    'audit_log_append_only_update_trigger',
    'audit_log_append_only_delete_trigger'
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = required_trigger AND NOT tgisinternal) THEN
      RAISE EXCEPTION 'Required P25 trigger is missing: %', required_trigger;
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeacherTimetableException_substitute_required_check') THEN
    RAISE EXCEPTION 'P25 substitute assignment constraint is missing';
  END IF;
END $$;

-- Required integration scenarios using two independent connections and a normal
-- application role (not table owner, superuser or BYPASSRLS):
-- 1. Set app.current_organization_id and app.current_school_id transaction-locally.
-- 2. Insert overlapping active slots for the same teacher across two assignments;
--    second write must fail with SQLSTATE 23P01.
-- 3. Insert overlapping active slots for different teachers sharing one room;
--    second write must fail with SQLSTATE 23P01.
-- 4. Insert adjacent periods (09:00-09:45 and 09:45-10:30); both must succeed.
-- 5. Insert same teacher/room periods with disjoint effective date ranges; both succeed.
-- 6. Insert substitute/override exception colliding with another active period on that
--    date; second write must fail with SQLSTATE 23P01. CANCEL must not collide.
-- 7. Race two conflicting writes on independent connections; exactly one commits.
-- 8. UPDATE and DELETE an AuditLog row; both must fail with SQLSTATE 55000.
-- 9. Verify tenant A cannot read or mutate tenant B timetable/room rows under RLS.
-- 10. Verify SCHOOL_ADMIN role has every Permission row linked after `prisma db seed`.
