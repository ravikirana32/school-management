# P513 Delivery Report — Discounts, Scholarships & Concessions

## Delivered
- New `FeeConcession` Prisma model with school/organization/student/charge identity, concession type/value, calculated amount, reason, request and decision metadata, status and timestamps.
- Migration creates concession table, tenant-scoped composite charge FK, positive amount constraints, percentage <=100 validation and indexes.
- API: list concessions per charge; request concession; independent approval/rejection.
- Fixed and percentage requests, cent rounding, remaining concession budget checks.
- Draft charge only; requests are not allowed after charge approval/publishing.
- `fees.manage` request permission and `fees.approve` decision permission; maker-checker self-approval block.
- Prevents duplicate pending requests and enforces approved concessions do not exceed gross charge.
- Audit logging for request and decisions.
- Finance UI panel with request flow and gross/approved/net display.
- Gross fee amount remains unchanged; P514 billing integration will consume approved net concession amounts.

## Verification
- Focused verifier: 27/27 PASS, including 9 calculation scenarios and TypeScript parse audits.
- P509 verifier: 23/23 PASS.
- P510 verifier: 23/23 PASS; UI/API parse diagnostics zero.
- P511 verifier: 16/16 PASS.
- P512 verifier: 13/13 PASS; arithmetic edge checks 6/6 PASS.
- P513 verifier: 27/27 PASS.
- Five focused/regression scripts exited 0.
- Full Prisma validate/generate/migrate, builds, runtime API, DB tenant/RLS checks, mobile and E2E remain pending local validation.

## P513 gaps carried forward
See root `MASTER-OPEN-GAPS-REGISTER.md` P513 section. Billing netting is explicitly deferred to P514; school-wide eligibility/cohort rules remain open.
