# P140 Delivery Report

P140 makes historical refund allocation evidence identify the exact operational payment slice being refunded. The API accepts `targetOperationalPaymentId`, verifies the payment belongs to the selected historical payment row in the same tenant, and rejects ambiguous split-payment targets without an explicit slice. Single-slice targets are inferred and recorded. When the target payment has multiple operational slices, the payment batch must be operationalized first and the refund allocation must then select one of its payment IDs; same-batch split-payment refunds are rejected because their operational IDs do not exist before the batch transaction.

Operationalization now resolves the refund against the selected payment ID and preserves the existing per-payment refund ceiling, charge balance reduction, settled refund event, payment refund status and immutable operational allocation link. Dependency planning recognizes the selected slice. School Admin Finance exposes payment-slice IDs and the selection field.

A migration adds the nullable tenant-scoped FK. PostgreSQL migration application, Prisma client generation and runtime transaction verification remain outstanding. Unit/API/browser/mobile test creation and execution remain deferred.
