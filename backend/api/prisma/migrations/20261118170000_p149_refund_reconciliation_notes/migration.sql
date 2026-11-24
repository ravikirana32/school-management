CREATE TABLE "StudentFeeRefundReconciliationNote" (
 "id" TEXT PRIMARY KEY,
 "organizationId" TEXT NOT NULL,
 "schoolId" TEXT NOT NULL,
 "refundId" TEXT NOT NULL,
 "authorUserId" TEXT NOT NULL,
 "note" VARCHAR(2000) NOT NULL,
 "resolutionStatus" VARCHAR(24) NOT NULL DEFAULT 'OPEN',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "StudentFeeRefundReconciliationNote_refund_fkey" FOREIGN KEY ("refundId","organizationId","schoolId") REFERENCES "StudentFeeRefund"("id","organizationId","schoolId") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "StudentFeeRefundReconciliationNote_scope_refund_created_idx" ON "StudentFeeRefundReconciliationNote"("organizationId","schoolId","refundId","createdAt");
