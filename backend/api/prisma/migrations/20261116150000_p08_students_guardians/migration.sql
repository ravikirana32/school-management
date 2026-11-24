CREATE TYPE "StudentStatus" AS ENUM ('APPLICANT','ACTIVE','INACTIVE','TRANSFERRED','GRADUATED','WITHDRAWN','ARCHIVED');
CREATE TYPE "GuardianRelationship" AS ENUM ('MOTHER','FATHER','LEGAL_GUARDIAN','GRANDPARENT','SIBLING','OTHER');
CREATE TYPE "StudentEnrollmentStatus" AS ENUM ('ENROLLED','PROMOTED','TRANSFERRED','WITHDRAWN','COMPLETED');
CREATE TYPE "StudentDocumentType" AS ENUM ('BIRTH_CERTIFICATE','TRANSFER_CERTIFICATE','PHOTO','ADDRESS_PROOF','IDENTITY_PROOF','MEDICAL','PREVIOUS_MARKSHEET','CONSENT','OTHER');

ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_id_org_school_key" UNIQUE ("id","organizationId","schoolId");

CREATE TABLE "Student" (
 "id" TEXT PRIMARY KEY,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,
 "admissionNumber" TEXT NOT NULL,"firstName" TEXT NOT NULL,"middleName" TEXT,"lastName" TEXT,
 "preferredName" TEXT,"dateOfBirth" DATE,"gender" TEXT,"bloodGroup" TEXT,"nationality" TEXT,
 "primaryLanguage" TEXT,"email" TEXT,"phone" TEXT,"addressLine1" TEXT,"addressLine2" TEXT,
 "locality" TEXT,"city" TEXT,"state" TEXT,"postalCode" TEXT,"countryCode" TEXT NOT NULL DEFAULT 'IN',
 "status" "StudentStatus" NOT NULL DEFAULT 'APPLICANT',"admissionDate" DATE,"leavingDate" DATE,
 "notes" TEXT,"createdBy" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Student_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE,
 CONSTRAINT "Student_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
 CONSTRAINT "Student_admission_school_key" UNIQUE ("schoolId","admissionNumber"),
 CONSTRAINT "Student_id_org_school_key" UNIQUE ("id","organizationId","schoolId"),
 CONSTRAINT "Student_leaving_date_check" CHECK ("leavingDate" IS NULL OR "admissionDate" IS NULL OR "leavingDate" >= "admissionDate")
);
CREATE INDEX "Student_org_school_status_idx" ON "Student"("organizationId","schoolId","status");
CREATE INDEX "Student_school_name_idx" ON "Student"("schoolId","lastName","firstName");
CREATE INDEX "Student_school_dob_idx" ON "Student"("schoolId","dateOfBirth");

CREATE TABLE "Guardian" (
 "id" TEXT PRIMARY KEY,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,
 "firstName" TEXT NOT NULL,"lastName" TEXT,"email" TEXT,"phone" TEXT,"alternatePhone" TEXT,
 "occupation" TEXT,"address" TEXT,"isActive" BOOLEAN NOT NULL DEFAULT true,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Guardian_school_org_fkey" FOREIGN KEY ("schoolId","organizationId") REFERENCES "School"("id","organizationId") ON DELETE CASCADE
);
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_id_org_school_key" UNIQUE ("id","organizationId","schoolId");
CREATE INDEX "Guardian_org_school_phone_idx" ON "Guardian"("organizationId","schoolId","phone");
CREATE INDEX "Guardian_org_school_email_idx" ON "Guardian"("organizationId","schoolId","email");

CREATE TABLE "StudentGuardian" (
 "id" TEXT PRIMARY KEY,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,
 "studentId" TEXT NOT NULL,"guardianId" TEXT NOT NULL,"relationship" "GuardianRelationship" NOT NULL,
 "isPrimary" BOOLEAN NOT NULL DEFAULT false,"isEmergency" BOOLEAN NOT NULL DEFAULT false,
 "canPickup" BOOLEAN NOT NULL DEFAULT false,"canReceiveCommunications" BOOLEAN NOT NULL DEFAULT true,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "StudentGuardian_student_school_fkey" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
 CONSTRAINT "StudentGuardian_guardian_school_fkey" FOREIGN KEY ("guardianId","organizationId","schoolId") REFERENCES "Guardian"("id","organizationId","schoolId") ON DELETE CASCADE,
 CONSTRAINT "StudentGuardian_student_guardian_key" UNIQUE ("studentId","guardianId")
);
CREATE INDEX "StudentGuardian_org_school_guardian_idx" ON "StudentGuardian"("organizationId","schoolId","guardianId");
CREATE INDEX "StudentGuardian_org_school_student_idx" ON "StudentGuardian"("organizationId","schoolId","studentId");

CREATE TABLE "StudentEnrollment" (
 "id" TEXT PRIMARY KEY,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,
 "studentId" TEXT NOT NULL,"academicYearId" TEXT NOT NULL,"gradeLevelId" TEXT NOT NULL,
 "sectionName" TEXT,"rollNumber" TEXT,"status" "StudentEnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
 "enrolledOn" DATE NOT NULL,"endedOn" DATE,"createdBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "StudentEnrollment_student_fkey" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
 CONSTRAINT "StudentEnrollment_year_fkey" FOREIGN KEY ("academicYearId","organizationId","schoolId") REFERENCES "AcademicYear"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "StudentEnrollment_grade_fkey" FOREIGN KEY ("gradeLevelId","organizationId","schoolId") REFERENCES "GradeLevel"("id","organizationId","schoolId") ON DELETE RESTRICT,
 CONSTRAINT "StudentEnrollment_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
 CONSTRAINT "StudentEnrollment_dates_check" CHECK ("endedOn" IS NULL OR "endedOn" >= "enrolledOn"),
 CONSTRAINT "StudentEnrollment_student_year_key" UNIQUE ("studentId","academicYearId"),
 CONSTRAINT "StudentEnrollment_roll_key" UNIQUE ("schoolId","academicYearId","gradeLevelId","rollNumber")
);
CREATE INDEX "StudentEnrollment_org_school_year_grade_idx" ON "StudentEnrollment"("organizationId","schoolId","academicYearId","gradeLevelId");
CREATE INDEX "StudentEnrollment_school_student_status_idx" ON "StudentEnrollment"("schoolId","studentId","status");

CREATE TABLE "StudentPickupContact" (
 "id" TEXT PRIMARY KEY,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,"studentId" TEXT NOT NULL,
 "fullName" TEXT NOT NULL,"relationship" TEXT NOT NULL,"phone" TEXT NOT NULL,"identityNote" TEXT,
 "validFrom" DATE,"validUntil" DATE,"isActive" BOOLEAN NOT NULL DEFAULT true,"createdBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "StudentPickupContact_student_fkey" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
 CONSTRAINT "StudentPickupContact_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
 CONSTRAINT "StudentPickupContact_dates_check" CHECK ("validUntil" IS NULL OR "validFrom" IS NULL OR "validUntil" >= "validFrom")
);
CREATE INDEX "StudentPickupContact_org_school_student_idx" ON "StudentPickupContact"("organizationId","schoolId","studentId","isActive");

CREATE TABLE "StudentDocument" (
 "id" TEXT PRIMARY KEY,"organizationId" TEXT NOT NULL,"schoolId" TEXT NOT NULL,"studentId" TEXT NOT NULL,
 "documentType" "StudentDocumentType" NOT NULL,"displayName" TEXT NOT NULL,"objectKey" TEXT NOT NULL,
 "mimeType" TEXT,"sizeBytes" BIGINT,"issuedAt" DATE,"expiresAt" DATE,"uploadedBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "StudentDocument_student_fkey" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
 CONSTRAINT "StudentDocument_uploader_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT,
 CONSTRAINT "StudentDocument_size_check" CHECK ("sizeBytes" IS NULL OR "sizeBytes" >= 0),
 CONSTRAINT "StudentDocument_expiry_check" CHECK ("expiresAt" IS NULL OR "issuedAt" IS NULL OR "expiresAt" >= "issuedAt")
);
CREATE INDEX "StudentDocument_org_school_student_idx" ON "StudentDocument"("organizationId","schoolId","studentId","documentType");

DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['Student','Guardian','StudentGuardian','StudentEnrollment','StudentPickupContact','StudentDocument']
 LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format(
   'CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'',true) AND "schoolId" = current_setting(''app.current_school_id'',true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'',true) AND "schoolId" = current_setting(''app.current_school_id'',true))',
   lower(t || '_school_tenant_isolation'),t
  );
 END LOOP;
END $$;
