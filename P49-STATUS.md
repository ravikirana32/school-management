# P49 Status — Notification lifecycle regression coverage

**Status:** Regression coverage and integration acceptance plan added; runtime acceptance pending. **Production approval: NOT GRANTED.**

- Expanded HMAC helper tests for current/previous key overlap, legacy compatibility, missing/malformed previous-key configuration and duplicate versions.
- Added a static verifier that checks P45 delivery-event uniqueness/RLS, P46 suppression/audit uniqueness/RLS, P48 versioning, webhook signature enforcement and worker pre-send guard.
- Added a detailed disposable PostgreSQL/Redis integration acceptance plan for webhook replay/order, cross-school isolation, atomic audit, key rollover and worker behavior.
- Vitest, Prisma, PostgreSQL/RLS, Redis, worker and browser/mobile tests were not run in this environment.
