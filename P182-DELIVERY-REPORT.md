# P182 Delivery Report — Admissions Guardian Identity Safety

## Scope
Improve guardian matching during admission-to-student conversion to avoid unsafe automatic reuse of ambiguous records.

## Implemented
- Admission conversion now retrieves up to 10 active same-school guardian matches for application guardian phone and optional email.
- When more than one active guardian matches, conversion aborts with HTTP 409 and `GUARDIAN_MATCH_AMBIGUOUS` plus limited candidate identifiers/contact fields for staff resolution.
- Transaction rollback prevents student/enrollment creation when guardian identity is ambiguous.
- When exactly one match exists, it is reused; when none exists, a guardian is created.
- Existing parent-module merge preview and explicitly-confirmed merge endpoint remain the supported safe merge workflow; account conflicts are rejected.
- Root and docs gap registers updated.

## Verification
- Baseline P181 ZIP integrity verified before extraction.
- Source patch applied and inspected.
- No build, test, migration execution, or runtime acceptance performed (deferred per user instruction).
- Final cumulative ZIP integrity and SHA-256 checked.

## Remaining guardian identity gaps
- Review UI for ambiguous candidates in the admissions conversion workflow.
- Staff-driven account linking verification flow and ownership checks across all guardian workflows.
- Consistent normalized phone/email uniqueness policy, international phone normalization and collision remediation.
- Concurrency-safe matching guarantees and verification acceptance.
