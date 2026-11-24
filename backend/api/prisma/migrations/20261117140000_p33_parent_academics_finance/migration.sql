-- P33: parent-facing fee statements, homework, report cards and notifications.
CREATE TABLE "StudentFeeCharge" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "studentId" TEXT NOT NULL,
  "chargeCode" TEXT NOT NULL, "title" VARCHAR(160) NOT NULL, "description" VARCHAR(2000), "category" VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
  "currency" VARCHAR(3) NOT NULL DEFAULT 'INR', "amount" DECIMAL(12,2) NOT NULL, "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "dueAt" DATE, "status" VARCHAR(16) NOT NULL DEFAULT 'DRAFT', "publishedAt" TIMESTAMP(3), "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentFeeCharge_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "StudentFeeCharge_student_fk" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "StudentFeeCharge_amount_ck" CHECK ("amount">=0 AND "amountPaid">=0 AND "amountPaid"<="amount"),
  CONSTRAINT "StudentFeeCharge_status_ck" CHECK ("status" IN ('DRAFT','PUBLISHED','PAID','PARTIALLY_PAID','OVERDUE','CANCELLED'))
);
CREATE UNIQUE INDEX "StudentFeeCharge_code_uq" ON "StudentFeeCharge"("schoolId","studentId","chargeCode");
CREATE INDEX "StudentFeeCharge_parent_idx" ON "StudentFeeCharge"("organizationId","schoolId","studentId","status","dueAt");

CREATE TABLE "StudentFeePayment" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "studentId" TEXT NOT NULL, "chargeId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL, "currency" VARCHAR(3) NOT NULL DEFAULT 'INR', "method" VARCHAR(30) NOT NULL, "reference" VARCHAR(120) NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'RECORDED', "paidAt" DATE NOT NULL, "recordedBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentFeePayment_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "StudentFeePayment_student_fk" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "StudentFeePayment_charge_fk" FOREIGN KEY ("chargeId","organizationId","schoolId") REFERENCES "StudentFeeCharge"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "StudentFeePayment_amount_ck" CHECK ("amount">0), CONSTRAINT "StudentFeePayment_status_ck" CHECK ("status" IN ('RECORDED','REVERSED'))
);
CREATE UNIQUE INDEX "StudentFeePayment_reference_uq" ON "StudentFeePayment"("schoolId","chargeId","reference");
CREATE INDEX "StudentFeePayment_parent_idx" ON "StudentFeePayment"("organizationId","schoolId","studentId","paidAt");

CREATE TABLE "HomeworkAssignment" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "studentId" TEXT NOT NULL, "title" VARCHAR(180) NOT NULL,
  "subjectName" VARCHAR(100) NOT NULL, "description" VARCHAR(4000) NOT NULL, "dueAt" TIMESTAMP(3), "attachmentMetadata" JSONB,
  "status" VARCHAR(16) NOT NULL DEFAULT 'DRAFT', "publishedAt" TIMESTAMP(3), "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomeworkAssignment_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "HomeworkAssignment_student_fk" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "HomeworkAssignment_status_ck" CHECK ("status" IN ('DRAFT','PUBLISHED','CANCELLED'))
);
CREATE INDEX "HomeworkAssignment_parent_idx" ON "HomeworkAssignment"("organizationId","schoolId","studentId","status","dueAt");

CREATE TABLE "StudentReportCard" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "studentId" TEXT NOT NULL, "academicYearId" TEXT NOT NULL,
  "termLabel" VARCHAR(80) NOT NULL, "resultSummary" JSONB NOT NULL, "teacherRemarks" VARCHAR(2000), "principalRemarks" VARCHAR(2000),
  "status" VARCHAR(16) NOT NULL DEFAULT 'DRAFT', "publishedAt" TIMESTAMP(3), "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentReportCard_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "StudentReportCard_student_fk" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE,
  CONSTRAINT "StudentReportCard_status_ck" CHECK ("status" IN ('DRAFT','PUBLISHED','WITHDRAWN'))
);
CREATE UNIQUE INDEX "StudentReportCard_term_uq" ON "StudentReportCard"("schoolId","studentId","academicYearId","termLabel");
CREATE INDEX "StudentReportCard_parent_idx" ON "StudentReportCard"("organizationId","schoolId","studentId","status","publishedAt");

CREATE TABLE "ParentNotification" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "recipientUserId" TEXT NOT NULL, "studentId" TEXT,
  "category" VARCHAR(40) NOT NULL, "title" VARCHAR(180) NOT NULL, "body" VARCHAR(2000) NOT NULL, "readAt" TIMESTAMP(3), "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ParentNotification_id_org_school_uq" UNIQUE ("id","organizationId","schoolId"),
  CONSTRAINT "ParentNotification_student_fk" FOREIGN KEY ("studentId","organizationId","schoolId") REFERENCES "Student"("id","organizationId","schoolId") ON DELETE CASCADE
);
CREATE INDEX "ParentNotification_parent_idx" ON "ParentNotification"("organizationId","schoolId","recipientUserId","createdAt");
CREATE INDEX "ParentNotification_unread_idx" ON "ParentNotification"("recipientUserId","readAt","createdAt");

DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['StudentFeeCharge','StudentFeePayment','HomeworkAssignment','StudentReportCard','ParentNotification'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t); EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true)) WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) AND "schoolId" = current_setting(''app.current_school_id'', true))',t||'_tenant_policy',t);
END LOOP; END $$;
