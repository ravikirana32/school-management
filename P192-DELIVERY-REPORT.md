# P192 — Admissions Parent Notification Preferences & Consent Controls (source remediation)

- [x] P192-G001 — Extend parent notification preference API accepted category set with `ADMISSIONS` so parent-controlled channel opt-out can apply to admissions messages.
- [x] P192-G002 — Existing preference GET/PUT endpoints remain tenant/school/user scoped and use upsert for deterministic channel settings.
- [x] P192-G003 — Supported channel values remain `IN_APP`, `EMAIL`, `PUSH`; preferences are per category and channel.
- [ ] P192-G004 — Dedicated Admissions preference UI, explicit consent/versioned notice records, consent evidence and withdrawal audit are OPEN.
- [ ] P192-G005 — Ensure all admission notification producer/worker paths honor ADMISSIONS preferences — OPEN for integration/runtime verification.
- [ ] P192-G006 — Build, typecheck, unit/API/security and runtime acceptance — DEFERRED by project instruction.

P192 is source implemented for the preference API category contract only; not accepted end-to-end.
