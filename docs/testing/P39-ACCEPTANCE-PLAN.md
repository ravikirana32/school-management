# P39 acceptance plan

## Source checks performed
- TypeScript syntax transpilation for changed TS/TSX files.
- Static assertions for UI wiring, permissions, API route, event timeline and parent download action.
- Artifact manifest JSON parsing, root/docs gap-register parity and cumulative ZIP integrity.

## Runtime acceptance still required
1. Prisma validate/generate and apply/reapply all migrations in disposable PostgreSQL.
2. Non-owner RLS tests for cross-tenant schema/report reads and mutations.
3. API tests for role boundaries, author self-approval, reject reason, concurrent decisions, publish state races and list bounds.
4. Browser E2E for schema creation, activation, review, rejection, approval and publish.
5. Parent iOS/Android E2E for consent, school switching, signed PDF opening, expiry and withdrawal.
6. S3 integration for private ACL, encryption, signed URL expiry and storage failure behavior.

No runtime tests are claimed by this phase.
