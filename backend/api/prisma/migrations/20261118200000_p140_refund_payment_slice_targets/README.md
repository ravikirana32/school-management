# P140 migration

Adds `AccountingHistoricalAllocation.targetOperationalPaymentId` and a tenant-scoped composite foreign key to `StudentFeePayment`. Apply through the existing Prisma migration deployment process, then regenerate Prisma Client before deploying API code.
