# P64 Status — Provider event versus manual release precedence

**Status:** Source implementation and test source complete; runtime acceptance pending. **Production approval: NOT GRANTED.**

- Added policy comparing provider event occurrence time with the latest matching suppression release time.
- Delayed BOUNCED/COMPLAINED events that occurred at or before a later manual release no longer recreate active suppression.
- A genuinely newer provider event after release may create suppression again.
- Suppression insertion remains idempotent and audit is created only for a new row.
- Worker still checks active suppression before provider send, independent of user notification preference.
- Static verifier 8/8 PASS; TypeScript syntax 4 files, 0 diagnostics; Vitest/PostgreSQL release-event race tests NOT RUN.
