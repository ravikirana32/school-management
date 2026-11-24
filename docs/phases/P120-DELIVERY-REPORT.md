# P120 Delivery Report

P120 implements selected least-privilege and identity-context remediations.

1. Admissions reads now require `admissions.read`; writes require `admissions.manage`, in addition to active school membership.
2. Access member and assignment user-profile lookups now run under the authenticated user's identity RLS context.
3. Organization listing now reads organization rows under the authenticated user's identity RLS context.
4. The P119 route inventory statements were reconciled to the verifier's source counts: 250 route declarations, 236 authenticated, 14 explicit public exceptions.

The change is not a complete authorization certification. The remaining all-handler, resource-ownership, database-RLS and cross-tenant review remains open. No gap is closed without runtime/database evidence.
