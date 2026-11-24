-- P25: database-enforced timetable overlap rules and append-only audit events.
-- All timetable writers (including direct SQL) acquire the same school advisory lock.

CREATE OR REPLACE FUNCTION school_timetable_slot_overlap_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_staff_id TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW."organizationId" || ':' || NEW."schoolId", 0));

  IF NEW."isActive" = FALSE THEN
    RETURN NEW;
  END IF;

  SELECT a."staffMemberId" INTO current_staff_id
  FROM "TeacherAssignment" a
  WHERE a."id" = NEW."teacherAssignmentId"
    AND a."organizationId" = NEW."organizationId"
    AND a."schoolId" = NEW."schoolId"
    AND a."academicYearId" = NEW."academicYearId"
    AND a."isActive" = TRUE;

  IF current_staff_id IS NULL THEN
    RAISE EXCEPTION 'Timetable assignment is not valid in this school scope' USING ERRCODE = '23503';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "TeacherTimetableSlot" s
    JOIN "TeacherAssignment" a
      ON a."id" = s."teacherAssignmentId"
     AND a."organizationId" = s."organizationId"
     AND a."schoolId" = s."schoolId"
    WHERE s."organizationId" = NEW."organizationId"
      AND s."schoolId" = NEW."schoolId"
      AND s."academicYearId" = NEW."academicYearId"
      AND s."dayOfWeek" = NEW."dayOfWeek"
      AND s."isActive" = TRUE
      AND s."id" <> COALESCE(NEW."id", '')
      AND COALESCE(s."effectiveFrom", DATE '0001-01-01') <= COALESCE(NEW."effectiveTo", DATE '9999-12-31')
      AND COALESCE(NEW."effectiveFrom", DATE '0001-01-01') <= COALESCE(s."effectiveTo", DATE '9999-12-31')
      AND s."startsAt" < NEW."endsAt"
      AND NEW."startsAt" < s."endsAt"
      AND (
        a."staffMemberId" = current_staff_id
        OR (NEW."room" IS NOT NULL AND s."room" = NEW."room")
      )
  ) THEN
    RAISE EXCEPTION 'Timetable slot overlaps an existing teacher or room booking' USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER teacher_timetable_slot_overlap_guard_trigger
BEFORE INSERT OR UPDATE OF
  "teacherAssignmentId", "academicYearId", "dayOfWeek", "startsAt", "endsAt",
  "room", "effectiveFrom", "effectiveTo", "isActive"
ON "TeacherTimetableSlot"
FOR EACH ROW EXECUTE FUNCTION school_timetable_slot_overlap_guard();

CREATE OR REPLACE FUNCTION school_timetable_exception_overlap_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slot "TeacherTimetableSlot"%ROWTYPE;
  effective_assignment_id TEXT;
  effective_staff_id TEXT;
  effective_start TEXT;
  effective_end TEXT;
  effective_room TEXT;
  iso_day INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW."organizationId" || ':' || NEW."schoolId", 0));

  SELECT * INTO base_slot
  FROM "TeacherTimetableSlot" s
  WHERE s."id" = NEW."timetableSlotId"
    AND s."organizationId" = NEW."organizationId"
    AND s."schoolId" = NEW."schoolId";

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Base timetable slot not found in school scope' USING ERRCODE = '23503';
  END IF;

  IF NEW."isActive" = FALSE THEN
    RETURN NEW;
  END IF;

  IF EXTRACT(ISODOW FROM NEW."exceptionDate")::INTEGER <> base_slot."dayOfWeek"
     OR (base_slot."effectiveFrom" IS NOT NULL AND base_slot."effectiveFrom" > NEW."exceptionDate")
     OR (base_slot."effectiveTo" IS NOT NULL AND base_slot."effectiveTo" < NEW."exceptionDate") THEN
    RAISE EXCEPTION 'Exception date must fall on the slot weekday and within its effective date range' USING ERRCODE = '23514';
  END IF;

  IF NEW."exceptionType" = 'CANCEL' THEN
    RETURN NEW;
  END IF;

  effective_assignment_id := CASE
    WHEN NEW."exceptionType" = 'SUBSTITUTE' THEN NEW."substituteAssignmentId"
    ELSE base_slot."teacherAssignmentId"
  END;
  effective_start := COALESCE(NEW."startsAt", base_slot."startsAt");
  effective_end := COALESCE(NEW."endsAt", base_slot."endsAt");
  effective_room := COALESCE(NEW."room", base_slot."room");
  iso_day := EXTRACT(ISODOW FROM NEW."exceptionDate")::INTEGER;

  SELECT a."staffMemberId" INTO effective_staff_id
  FROM "TeacherAssignment" a
  WHERE a."id" = effective_assignment_id
    AND a."organizationId" = NEW."organizationId"
    AND a."schoolId" = NEW."schoolId"
    AND a."academicYearId" = base_slot."academicYearId"
    AND a."isActive" = TRUE
    AND (a."startsOn" IS NULL OR a."startsOn" <= NEW."exceptionDate")
    AND (a."endsOn" IS NULL OR a."endsOn" >= NEW."exceptionDate");

  IF effective_staff_id IS NULL THEN
    RAISE EXCEPTION 'Exception teacher assignment is not valid in this school scope' USING ERRCODE = '23503';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "TeacherTimetableSlot" s
    LEFT JOIN "TeacherTimetableException" e
      ON e."timetableSlotId" = s."id"
     AND e."exceptionDate" = NEW."exceptionDate"
     AND e."isActive" = TRUE
    JOIN "TeacherAssignment" a
      ON a."id" = CASE
        WHEN e."exceptionType" = 'SUBSTITUTE' THEN e."substituteAssignmentId"
        ELSE s."teacherAssignmentId"
      END
     AND a."organizationId" = s."organizationId"
     AND a."schoolId" = s."schoolId"
    WHERE s."organizationId" = NEW."organizationId"
      AND s."schoolId" = NEW."schoolId"
      AND s."id" <> base_slot."id"
      AND s."isActive" = TRUE
      AND s."dayOfWeek" = iso_day
      AND (s."effectiveFrom" IS NULL OR s."effectiveFrom" <= NEW."exceptionDate")
      AND (s."effectiveTo" IS NULL OR s."effectiveTo" >= NEW."exceptionDate")
      AND (e."id" IS NULL OR e."exceptionType" <> 'CANCEL')
      AND COALESCE(e."startsAt", s."startsAt") < effective_end
      AND effective_start < COALESCE(e."endsAt", s."endsAt")
      AND (
        a."staffMemberId" = effective_staff_id
        OR (effective_room IS NOT NULL AND COALESCE(e."room", s."room") = effective_room)
      )
  ) THEN
    RAISE EXCEPTION 'Timetable exception conflicts with another teacher or room booking on this date' USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER teacher_timetable_exception_overlap_guard_trigger
BEFORE INSERT OR UPDATE OF
  "timetableSlotId", "exceptionDate", "exceptionType", "substituteAssignmentId",
  "startsAt", "endsAt", "room", "isActive"
ON "TeacherTimetableException"
FOR EACH ROW EXECUTE FUNCTION school_timetable_exception_overlap_guard();

-- Audit events are append-only, including when written outside Prisma.
CREATE OR REPLACE FUNCTION school_audit_log_append_only_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only; UPDATE and DELETE are prohibited' USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER audit_log_append_only_update_trigger
BEFORE UPDATE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION school_audit_log_append_only_guard();

CREATE TRIGGER audit_log_append_only_delete_trigger
BEFORE DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION school_audit_log_append_only_guard();

ALTER TABLE "TeacherTimetableException"
  ADD CONSTRAINT "TeacherTimetableException_substitute_required_check"
  CHECK ("exceptionType" <> 'SUBSTITUTE' OR "substituteAssignmentId" IS NOT NULL);

CREATE INDEX "TeacherTimetableSlot_overlap_lookup_idx"
  ON "TeacherTimetableSlot" ("organizationId", "schoolId", "academicYearId", "dayOfWeek", "isActive", "startsAt", "endsAt");
