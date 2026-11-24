CREATE TYPE "AcademicYearStatus" AS ENUM ('DRAFT','ACTIVE','COMPLETED','ARCHIVED');
CREATE TYPE "AcademicTermType" AS ENUM ('TERM','SEMESTER','QUARTER','TRIMESTER','CUSTOM');
CREATE TYPE "CalendarEventType" AS ENUM ('HOLIDAY','SCHOOL_EVENT','EXAM','PARENT_MEETING','STAFF_EVENT','CLOSURE','OTHER');
CREATE TYPE "CalendarEventAudience" AS ENUM ('ALL','STUDENTS','STAFF','PARENTS');

CREATE TABLE "SchoolProfile" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL UNIQUE,
  "legalName" TEXT, "displayName" TEXT NOT NULL, "schoolType" TEXT, "boardKey" TEXT,
  "affiliationNumber" TEXT, "addressLine1" TEXT, "addressLine2" TEXT, "locality" TEXT,
  "city" TEXT, "state" TEXT, "postalCode" TEXT, "countryCode" TEXT NOT NULL DEFAULT 'IN',
  "phone" TEXT, "email" TEXT, "website" TEXT, "logoObjectKey" TEXT,
  "primaryLanguage" TEXT NOT NULL DEFAULT 'en', "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  "currency" TEXT NOT NULL DEFAULT 'INR', "dateFormat" TEXT NOT NULL DEFAULT 'DD-MM-YYYY',
  "weekStartsOn" INTEGER NOT NULL DEFAULT 1, "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolProfile_org_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "SchoolProfile_school_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "SchoolProfile_week_start_check" CHECK ("weekStartsOn" BETWEEN 0 AND 6)
);
CREATE INDEX "SchoolProfile_org_city_idx" ON "SchoolProfile"("organizationId","city");

CREATE TABLE "AcademicYear" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL, "code" TEXT NOT NULL, "startsOn" DATE NOT NULL, "endsOn" DATE NOT NULL,
  "status" "AcademicYearStatus" NOT NULL DEFAULT 'DRAFT', "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicYear_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "AcademicYear_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "AcademicYear_date_check" CHECK ("endsOn" >= "startsOn"),
  CONSTRAINT "AcademicYear_school_code_key" UNIQUE ("schoolId","code")
);
CREATE INDEX "AcademicYear_org_school_status_idx" ON "AcademicYear"("organizationId","schoolId","status");
CREATE INDEX "AcademicYear_school_dates_idx" ON "AcademicYear"("schoolId","startsOn","endsOn");
CREATE UNIQUE INDEX "AcademicYear_one_current_per_school_idx" ON "AcademicYear"("schoolId") WHERE "isCurrent" = true;

CREATE TABLE "AcademicTerm" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL, "name" TEXT NOT NULL, "code" TEXT NOT NULL,
  "termType" "AcademicTermType" NOT NULL DEFAULT 'TERM', "sequence" INTEGER NOT NULL,
  "startsOn" DATE NOT NULL, "endsOn" DATE NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicTerm_year_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE,
  CONSTRAINT "AcademicTerm_date_check" CHECK ("endsOn" >= "startsOn"),
  CONSTRAINT "AcademicTerm_code_key" UNIQUE ("academicYearId","code"),
  CONSTRAINT "AcademicTerm_sequence_key" UNIQUE ("academicYearId","sequence")
);
CREATE INDEX "AcademicTerm_org_school_start_idx" ON "AcademicTerm"("organizationId","schoolId","startsOn");

CREATE TABLE "SchoolCalendar" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL, "academicYearId" TEXT, "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolCalendar_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "SchoolCalendar_year_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL
);
CREATE INDEX "SchoolCalendar_org_school_idx" ON "SchoolCalendar"("organizationId","schoolId");
CREATE UNIQUE INDEX "SchoolCalendar_one_default_idx" ON "SchoolCalendar"("schoolId") WHERE "isDefault" = true;

CREATE TABLE "CalendarEvent" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "calendarId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
  "eventType" "CalendarEventType" NOT NULL, "audience" "CalendarEventAudience" NOT NULL DEFAULT 'ALL',
  "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL,
  "isAllDay" BOOLEAN NOT NULL DEFAULT true, "isInstructionDay" BOOLEAN NOT NULL DEFAULT false,
  "location" TEXT, "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CalendarEvent_calendar_fkey" FOREIGN KEY ("calendarId") REFERENCES "SchoolCalendar"("id") ON DELETE CASCADE,
  CONSTRAINT "CalendarEvent_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "CalendarEvent_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "CalendarEvent_date_check" CHECK ("endsAt" >= "startsAt")
);
CREATE INDEX "CalendarEvent_school_range_idx" ON "CalendarEvent"("organizationId","schoolId","startsAt","endsAt");
CREATE INDEX "CalendarEvent_calendar_type_idx" ON "CalendarEvent"("calendarId","eventType");

CREATE TABLE "SchoolDayConfiguration" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL, "isWorkingDay" BOOLEAN NOT NULL DEFAULT true,
  "opensAt" TEXT, "closesAt" TEXT, "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolDayConfiguration_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "SchoolDayConfiguration_day_check" CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  CONSTRAINT "SchoolDayConfiguration_school_day_key" UNIQUE ("schoolId","dayOfWeek")
);
CREATE INDEX "SchoolDayConfiguration_org_school_idx" ON "SchoolDayConfiguration"("organizationId","schoolId");

CREATE TABLE "SchoolPolicy" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
  "policyKey" TEXT NOT NULL, "value" JSONB NOT NULL, "version" INTEGER NOT NULL DEFAULT 1,
  "updatedBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolPolicy_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
  CONSTRAINT "SchoolPolicy_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "SchoolPolicy_key" UNIQUE ("schoolId","policyKey")
);
CREATE INDEX "SchoolPolicy_org_school_idx" ON "SchoolPolicy"("organizationId","schoolId");

-- Every school configuration table is protected by organization and school context.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['SchoolProfile','AcademicYear','AcademicTerm','SchoolCalendar','CalendarEvent','SchoolDayConfiguration','SchoolPolicy']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',
      lower(t || '_school_tenant_isolation'), t
    );
  END LOOP;
END $$;
