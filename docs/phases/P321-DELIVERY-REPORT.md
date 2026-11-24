# P321 — Exam Marks Entry Save-State Safeguards

## Scope adjustment
The cumulative P320 code already contained the P274 roster-driven exam marks table. P321 therefore avoids duplicating that work and improves the existing Cycle 1 marks-entry workflow instead.

## Delivered at source level
- Previously unentered student marks now display as blank rather than defaulting to `0`, avoiding accidental zero marks when the full roster is first loaded.
- Tracks changed student rows separately from saved/untouched marks.
- Save submits only changed rows, preserving the backend's merge behavior for untouched existing marks.
- Validates changed rows before submission: value required, finite numeric, and within 0..exam maximum.
- Converts values to numeric payload only after validation.
- Save action is disabled until changes exist; shows count of entered, not-entered and changed students.
- Shows per-row state: Saved, Changed, Not entered.
- After a successful save, refreshes the roster view with the saved mark set.
- Existing published-exam read-only state and permission gate retained.

## Verification
- Static source verifier: 10/10 PASS.
- TypeScript transpile syntax: 0 diagnostics for `ExamAssessmentWorkspace.tsx`.
- Runtime, API, database, browser, mobile, and full build/typecheck: not run.

## Open limitations
- API still does not provide an explicit clear/delete-mark operation. Clearing a previously saved mark locally is rejected as blank changed input; a mark cannot be intentionally removed through this flow.
- Publishing policy does not enforce complete roster coverage; this remains an API/business-policy gap.
- Runtime acceptance and teacher assignment scope enforcement for exam mark write routes remain open.
