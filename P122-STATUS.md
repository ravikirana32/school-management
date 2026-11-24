# P122 Status — Teacher-to-Student Resource Authorization

Status: targeted source implementation complete; runtime verification pending.

- Added a shared teacher-assignment-to-enrolled-student scope for report-card reads.
- Restricted report-card list results for active staff identities to students enrolled in currently active assigned academic year / grade / section combinations.
- Restricted report-card artifact metadata and published PDF URL issuance to the same assigned-student set.
- Preserved school-wide permission behavior for users without an active staff identity.
- Updated P119-G002 and P121-G003 descriptions; appended P122-G001..G003.
- No gaps closed or deleted; resolved history remains mirrored.
- Unit, API, browser and mobile test creation/execution remains deferred as instructed.

## Scope limitation
Student demographic/guardian PII, fee balances, historical record policy, substitute-teacher rules, worker paths and other teacher-facing modules remain open for subsequent phases.
