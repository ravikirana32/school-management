# P391 Delivery Report — F03 Invitation Delivery and Acceptance UI

## Delivered
- Organization invitation creation now fails closed with HTTP 503 before token creation if notification provider URL/token/from or organization-admin invitation base URL is missing.
- Invitation link is composed with the opaque token in the URL hash; the database stores only its SHA-256 token hash.
- Email provider request includes authorization, bounded timeout, invitation-ID idempotency key, and an organization invitation template payload.
- Provider failure revokes the pending invitation and writes a failure audit event with safe failure metadata (error class only, no raw token or provider body).
- Successful invitation delivery returns status `SENT` without exposing the token.
- Organization Admin can accept invitation tokens from URL hash via the existing authenticated acceptance endpoint and removes the token from the browser URL after success.
- Environment examples document `ORGANIZATION_ADMIN_INVITATION_BASE_URL`.
- Historical P389 verifier updated for the delivered email capability; new P391 verifier added.

## Remaining F03 (open)
- Complete dependency-ordered setup orchestration across board/curriculum, grade levels, sections, subjects, rooms, fee structures, roles and other domain workflows.
- Multi-campus inheritance, override resolution and safe scope-aware UX/API rules.
- Bulk configuration import/export with preview, validation, atomic commit and rollback/undo.
- Runtime provider delivery validation, Prisma/DB migrations, API runtime, browser acceptance and device E2E.

## Verification
- P391 source-contract verifier: 14/14 PASS.
- P389 invitation lifecycle verifier: 15/15 PASS.
- P390 prerequisite verifier: 10/10 PASS.
- P370–P391 regression verifier scripts: all PASS.
- TypeScript syntax parser scan: 247 files, 0 parse errors.
- Root and API package JSON parsed successfully (170 and 18 scripts).
- Runtime/API/database/provider/browser/mobile tests were not executed; static source verifiers do not represent runtime acceptance.
