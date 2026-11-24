# P356 — Library Management

## Scope delivered
- Prisma persistence: `LibraryBook`, `LibraryCopy`, `LibraryLoan`, `LibraryReservation`.
- PostgreSQL migration with indexes and relations.
- Tenant/school-scoped authenticated library API with permission gates.
- Catalogue list/search/create; create physical copy with accession number and shelf location.
- Dashboard counts for titles, copies, active loans, overdue loans and active reservations.
- Loan list; issue available copy to student/staff borrower; return and restore copy availability.
- Reservation create/list endpoints.
- School Admin Library workspace for catalogue, copy intake, issuing and returns.
- Seeded `library.read`, `library.manage` permissions and `SCHOOL_LIBRARY_STAFF` role; grants library permissions to Principal and HR role.
- Root and docs mirrored gap registers and changelog updated.

## Targeted verification
- `scripts/verify-p356-library.mjs`: 28/28 static source checks PASS.
- ZIP integrity test PASS; P355 baseline entries retained; duplicate archive entries 0.

## Limitations / open gaps
- Prisma generate/validate and migration apply not run (runtime dependencies/database not available).
- API live tests, school/tenant isolation runtime tests, full web typecheck/build, E2E and device validation not run.
- Reservation queue ordering/fulfillment/cancel/expiry workflow is incomplete.
- Fine calculation rules, fine settlement, lost/damaged copy lifecycle, copy condition updates, barcode/QR scanning, reports/export and notifications remain open.
- Student/parent mobile catalogue/hold requests are not integrated yet.
- Admin UI currently supports basic catalogue, copy intake, issue and return; richer reservation and overdue reporting UI remains open.
- UI uses borrower IDs entered by operator; validation against student/staff roster needs runtime integration.

P356 is delivered as a basic source implementation, not runtime-verified production readiness.
