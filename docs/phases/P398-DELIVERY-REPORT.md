# P398 Delivery Report

## Phase
P398 — Calendar and Event Configuration Transfer.

## Implementation summary
Extended the existing school-admin configuration-transfer utility to support calendars. The UI can export a selected calendar and its events into the existing versioned JSON envelope. Import validation is preview-first and validates the calendar/event shape, supported event types, date ordering, optional boolean flags, audience string, event count limit, and duplicate title/start-time pairs inside the import document. Apply uses the academic management permission and creates a new calendar and event records additively. Existing calendars are not changed.

## Files changed
- `apps/school-admin/src/school-config-transfer.ts`
- `apps/school-admin/src/SchoolConfigurationWorkspace.tsx`
- `scripts/verify-p398-calendar-config-transfer.mjs`
- `scripts/verify-p396-school-config-transfer.mjs` (permission verifier adapted for calendar scope)
- `package.json` (verify:p398 script)
- P398 reports, master registers and mirrored documentation

## Verification
- P398 verifier: 18/18.
- P397 verifier: 20/20.
- P396 verifier: 15/15.
- P370–P398 regression sweep: all discovered phase verifiers passed.
- Source syntax: 248 files, 0 parse errors.
- Package JSON valid.
- Archive integrity and baseline preservation checked separately.

## Risks / limitations
Sequential API calls mean a calendar may be created and some events added before a later event request fails. No transaction or cleanup compensation is implemented. Runtime and full integration verification remain unperformed.
