# P390 Status — F03 Backend Setup Prerequisite Enforcement

- **Cycle:** C2-04 / F03 Core School Onboarding
- **Status:** Delivered source slice; F03 remains IN_PROGRESS
- **Scope:** Enforce guided onboarding dependencies at API write boundaries for academic terms, calendars, working days, and school policies.
- **Implementation:** `backend/api/src/modules/schools/school-config.routes.ts`
- **Verifier:** `scripts/verify-p390-f03-backend-prerequisites.mjs`
- **Evidence:** 10/10 source assertions pass; P372 and P374–P389 relevant verifiers pass; TypeScript parser scan reports 247 files, zero parse errors.
- **Runtime limitations:** No dependency installation, API build/typecheck, DB migration or runtime test, nor browser/E2E acceptance was executed in this environment.
- **F03 closure:** Not achieved. Invitation delivery, complete setup orchestration, multi-campus inheritance/override workflow, bulk setup import preview/validation/rollback and runtime acceptance remain open.
- **F04:** Not started; blocked pending F03 completion.
