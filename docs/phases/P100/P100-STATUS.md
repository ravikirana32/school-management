# P100 Status — Student lifecycle workflow across API, School Admin and Parent Mobile

Status: FUNCTIONAL SOURCE SLICE IMPLEMENTED; LOCAL RUNTIME ACCEPTANCE DEFERRED.

## Delivered
- Student list API now includes `leavingDate` and `updatedAt` so School Admin can show lifecycle state and exit date.
- Student status transition endpoint rejects impossible calendar dates, not only malformed date strings.
- School Admin Students workspace now supports selecting a student, submitting a lifecycle transition with reason/effective date, and loading the student's status-history timeline.
- Parent Mobile displays the current status for each consent-linked student and can refresh student status/enrollment details from the server.
- Parent Mobile does not expose internal lifecycle reasons, actor identifiers or school-admin-only transition controls.
- Student API documentation updated.

## Deferred by user direction
Unit tests, API integration tests, browser E2E, mobile E2E and formal test-case creation are deferred to the later consolidated local-validation phase. No new test-only work was added in this phase.

## Not claimed
No local API/database/web/mobile runtime acceptance was executed. Existing status transition persistence, tenant RLS and app startup still require later local validation. Board-specific transition rules and retention/legal approval remain open.
