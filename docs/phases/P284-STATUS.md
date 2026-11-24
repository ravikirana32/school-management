# P284 Status — Student Portal

Implemented direct student-account linking and a separate Expo student-mobile app foundation in the cumulative P283 baseline.

## Delivered
- StudentAccountLink model and migration with tenant RLS and a composite student foreign key.
- School Admin link/unlink endpoints for active student records.
- Account linking accepts user ID or verified email; the new Admin UI uses verified email.
- Link requires the active user's email verification and exact case-insensitive match to the student record email.
- Prevents active student link conflict and prevents one user being linked to multiple students in a school.
- Link/unlink audit events.
- Student self-school discovery using linked active student account.
- Student profile endpoint with active enrollment details.
- Student-specific GENERAL announcement inbox and mark-read endpoints.
- New `apps/student-mobile` Expo app with sign-in/MFA support, school/student profile selection, announcements and read state.
- P281 broadcast fan-out includes directly linked student accounts for STUDENTS and ALL audiences; parent/guardian proxy remains for unlinked students.

## Verification
- Modified TypeScript/TSX syntax transpilation passed for student API, Admin component/navigation and student mobile app.
- Static assertions added for verified-email linking, school discovery, profile, inbox and UI wiring.
- ZIP integrity and checksum verified.
- Prisma validation/migration, API runtime, mobile typecheck and device E2E not run due missing dependencies.

## Open gaps
- P284-VAL01: Validate student-account link lifecycle, RLS and multi-school discovery with DB/API fixtures and mobile device acceptance.
- P284-G001: Link-account UI requires student record ID; improve lookup/search and account-link review queue.
- P284-G002: Student portal attendance, timetable, homework, results/report cards and fee view integrations remain future phases.
- P284-G003: Account linking currently uses exact verified email; alternate guardian-approved account linking and multi-student sibling accounts require product/security review.
