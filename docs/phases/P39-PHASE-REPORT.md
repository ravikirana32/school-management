# P39 phase report — Report-card operations UI

## Summary
P39 connects the P38 report-card governance APIs to an authenticated School Admin workspace and parent mobile download action. The School Admin can create schema drafts, activate versions with approval permission, review report-card submissions, inspect approval events, approve/reject and publish approved reports. Parent mobile users can request and open a consent-checked private PDF.

## Files added/changed
- `apps/school-admin/src/ReportCardGovernanceWorkspace.tsx` (new)
- `apps/school-admin/src/main.tsx` (reports tab permission and workspace routing)
- `apps/parent-mobile/App.tsx` (private PDF download action)
- `backend/api/src/modules/report-cards/report-card.routes.ts` (bounded report-card list and event timeline endpoint)
- P39 module/API/security/testing docs, manifest, P40 entry criteria and gap-register updates.

## Scope deliberately not claimed
- No visual drag/drop schema designer or board-pack library.
- No branded multi-page PDF, QR verification or localization.
- No report notification outbox/provider delivery.
- No payment provider decision.
- Academic-year/grade picker uses manually entered IDs pending lookup API integration.

## Verification
Syntax transpilation, static assertions, JSON/parity checks and ZIP integrity are source/artifact checks only. Prisma, PostgreSQL, RLS, S3, Vitest, full typecheck/build, Playwright and Expo device tests were not run. Runtime acceptance is NOT VERIFIED.
