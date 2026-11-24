# P396 Delivery Report

P396 implements limited bulk configuration transfer for School Admin settings.

- New module: `apps/school-admin/src/school-config-transfer.ts`.
- Integrated UI: `apps/school-admin/src/SchoolConfigurationWorkspace.tsx`.
- New verifier: `scripts/verify-p396-school-config-transfer.mjs`.
- Package command: `verify:p396`.

The feature supports JSON export and import preview/apply for Profile, Weekly Working Days, and Policies. It performs scope validation, basic field/data validation, and permission gating. API updates are sequential and have best-effort compensating rollback; do not treat this as atomic transactional import.
