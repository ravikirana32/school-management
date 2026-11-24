# P217 — Admissions Reviewer Workload & Queue Filters

## Delivered (source implementation)
- Added reviewer state storage in School Admin Admissions workspace, resolving the missing local reviewer-state declaration used by the assignment selector and API load flow.
- Added derived workload counts per active school reviewer for applications in SUBMITTED, UNDER_REVIEW, and DOCUMENTS_PENDING.
- Added assigned and unassigned active review queue counts.
- Added reviewer-specific queue cards with one-click filtering and a queue dropdown supporting all, unassigned, and individual reviewers.
- Reviewer queue selection resets status/search to provide a clear reviewer-specific view; the clear filters action also clears reviewer queue selection.
- Added styling for reviewer queue filter control.

## Scope/limitations
- Counts are computed from the already loaded, school-scoped applications; current API list limits remain unchanged.
- “Assigned to me” is not implemented because the current session surface does not expose a reliable current-user identifier to this component.
- No workload balancing/auto-assignment, assignment audit history, SLA aging/priority, notifications, or Staff Mobile parity in this phase.
- No build, typecheck, database migration execution, API tests, mobile build, deployment, or E2E validation performed (deferred by user).

## Source-level checks
- Confirmed reviewer state declaration and setter exist.
- Confirmed derived assigned/unassigned queue counts and reviewer workload aggregation exist.
- Confirmed reviewer queue selector/cards and clear/reset behavior exist.
- Confirmed master gap register copies match byte-for-byte.
- Cumulative ZIP integrity verified.
