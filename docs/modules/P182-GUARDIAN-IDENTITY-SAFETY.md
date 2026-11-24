# P182 — Guardian Identity Safety in Admissions Conversion

Admissions conversion now avoids first-match guardian reuse when multiple active guardians in the same organization/school match the application phone or email. Ambiguous matching raises HTTP 409 `GUARDIAN_MATCH_AMBIGUOUS` with limited candidate data, aborting the transaction before student/enrollment records are committed. A single match is reused; no match creates a guardian.

Existing parent module merge preview and explicit merge endpoint remain available. The merge workflow rejects conflicting user-account ownership and requires explicit confirmation. No runtime/build/test validation was performed in this phase.

See `P182-DELIVERY-REPORT.md` and the master open-gaps register.
