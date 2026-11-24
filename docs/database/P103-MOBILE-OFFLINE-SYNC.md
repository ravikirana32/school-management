# P103 — Mobile Offline Database Changes

Migration: `20261118020000_p103_mobile_offline_sync`.

`MobileMutationReceipt` stores the user/tenant/school-scoped idempotency key, request payload hash and JSON response. The unique key is `(organizationId, schoolId, userId, idempotencyKey)`. The row is created in the same transaction as attendance marks so a successful mutation and replay receipt cannot diverge.

Forced RLS requires organization, school and current user settings to match. Receipt retention/cleanup is not automated in P103 and remains an operational gap.
