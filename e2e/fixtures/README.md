# E2E fixture contract

Authenticated tests must use a disposable seeded tenant. CI must provide one organization and school isolated per run; test identities for Super Admin, School Admin, Teacher, Parent, Student and Driver; synthetic student/guardian records only; a unique run ID and deterministic cleanup; sandbox-only provider credentials; and role-scoped storage state generated at job runtime. Never commit credentials or storage state.

Required metadata: `E2E_TEST_ORGANIZATION_ID`, `E2E_TEST_SCHOOL_ID`, `E2E_TEST_RUN_ID`. Never write passwords/tokens to `.env.example`, logs, screenshots, traces or artifacts.
