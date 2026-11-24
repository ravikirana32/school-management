-- P22: database-level canonical room enforcement and school-wide write serialization.
-- The same school-scoped advisory lock is used by API timetable writes and room lifecycle writes.
CREATE OR REPLACE FUNCTION school_room_reference_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(OLD."organizationId" || ':' || OLD."schoolId", 0));
  IF NEW."code" <> OLD."code" AND (
    EXISTS (SELECT 1 FROM "TeacherTimetableSlot" s WHERE s."organizationId" = OLD."organizationId" AND s."schoolId" = OLD."schoolId" AND s."room" = OLD."code") OR
    EXISTS (SELECT 1 FROM "TeacherTimetableException" e WHERE e."organizationId" = OLD."organizationId" AND e."schoolId" = OLD."schoolId" AND e."room" = OLD."code")
  ) THEN
    RAISE EXCEPTION 'Room code cannot change while timetable references exist' USING ERRCODE = '23514';
  END IF;
  IF OLD."isActive" = TRUE AND NEW."isActive" = FALSE AND (
    EXISTS (SELECT 1 FROM "TeacherTimetableSlot" s WHERE s."organizationId" = OLD."organizationId" AND s."schoolId" = OLD."schoolId" AND s."room" = OLD."code" AND s."isActive" = TRUE) OR
    EXISTS (SELECT 1 FROM "TeacherTimetableException" e WHERE e."organizationId" = OLD."organizationId" AND e."schoolId" = OLD."schoolId" AND e."room" = OLD."code" AND e."isActive" = TRUE)
  ) THEN
    RAISE EXCEPTION 'Room cannot be deactivated while active timetable references exist' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER school_room_reference_guard_trigger
BEFORE UPDATE OF "code", "isActive" ON "SchoolRoom"
FOR EACH ROW EXECUTE FUNCTION school_room_reference_guard();

CREATE OR REPLACE FUNCTION timetable_slot_room_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE room_is_active BOOLEAN;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW."organizationId" || ':' || NEW."schoolId", 0));
  IF NEW."room" IS NOT NULL AND btrim(NEW."room") <> '' THEN
    SELECT r."isActive" INTO room_is_active FROM "SchoolRoom" r
      WHERE r."organizationId" = NEW."organizationId" AND r."schoolId" = NEW."schoolId" AND r."code" = NEW."room";
    IF COALESCE(room_is_active, FALSE) = FALSE THEN
      RAISE EXCEPTION 'Timetable slot room must reference an active canonical room' USING ERRCODE = '23503';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER timetable_slot_room_guard_trigger
BEFORE INSERT OR UPDATE OF "room" ON "TeacherTimetableSlot"
FOR EACH ROW EXECUTE FUNCTION timetable_slot_room_guard();

CREATE OR REPLACE FUNCTION timetable_exception_room_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE room_is_active BOOLEAN;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW."organizationId" || ':' || NEW."schoolId", 0));
  IF NEW."room" IS NOT NULL AND btrim(NEW."room") <> '' THEN
    SELECT r."isActive" INTO room_is_active FROM "SchoolRoom" r
      WHERE r."organizationId" = NEW."organizationId" AND r."schoolId" = NEW."schoolId" AND r."code" = NEW."room";
    IF COALESCE(room_is_active, FALSE) = FALSE THEN
      RAISE EXCEPTION 'Timetable exception room must reference an active canonical room' USING ERRCODE = '23503';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER timetable_exception_room_guard_trigger
BEFORE INSERT OR UPDATE OF "room" ON "TeacherTimetableException"
FOR EACH ROW EXECUTE FUNCTION timetable_exception_room_guard();
