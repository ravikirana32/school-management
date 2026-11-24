# P220 — Admissions Reviewer Decision Transition Guard

## Implemented
- Final application transitions to APPROVED or REJECTED now require a structured DECISION review note with a matching recommendation (APPROVE or REJECT respectively).
- Validation runs inside the tenant/school-scoped transition transaction and checks application-specific review notes.
- Existing transition allow-list, conditional status update concurrency guard, and stage history recording remain in place.
- Missing matching recommendation returns HTTP 409 with code `ADMISSION_DECISION_NOTE_REQUIRED`; no status change is made.

## Scope / verification
- Static source checks only.
- No build, typecheck, tests, database migration/runtime, API runtime, mobile build, deployment, or E2E validation performed (deferred per project instructions).

## Remaining admissions gaps
- Reviewer notifications and SLA/aging/priority.
- Applicant correction/request-information lifecycle and portal workflow.
- Reviewer mobile parity.
- Runtime/integration/security acceptance in final validation.
