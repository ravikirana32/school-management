ALTER TABLE "StudentFeeRefundReconciliationNote"
  ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE TABLE "StudentFeeRefundReconciliationEvidence" (
 "id" TEXT PRIMARY KEY,
 "organizationId" TEXT NOT NULL,
 "schoolId" TEXT NOT NULL,
 "refundId" TEXT NOT NULL,
 "noteId" TEXT NOT NULL,
 "addedByUserId" TEXT NOT NULL,
 "label" VARCHAR(180) NOT NULL,
 "referenceType" VARCHAR(24) NOT NULL,
 "referenceValue" VARCHAR(1000) NOT NULL,
 "mimeType" VARCHAR(120),
 "checksumSha256" VARCHAR(64),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "RefundReconEvidence_note_fkey" FOREIGN KEY ("noteId") REFERENCES "StudentFeeRefundReconciliationNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "RefundReconEvidence_refund_fkey" FOREIGN KEY ("refundId","organizationId","schoolId") REFERENCES "StudentFeeRefund"("id","organizationId","schoolId") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "RefundReconEvidence_scope_refund_note_created_idx" ON "StudentFeeRefundReconciliationEvidence"("organizationId","schoolId","refundId","noteId","createdAt");
