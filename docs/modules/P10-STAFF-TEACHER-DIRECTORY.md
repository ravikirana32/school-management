# P10 — Staff and teacher directory

## Delivered source foundation
- School-scoped staff departments and designations, including teaching-role metadata.
- Staff member records with employee number, contact/profile fields, employment type and lifecycle status.
- Initial employment-history snapshot on staff creation.
- Status-change audit events; separated records cannot be reactivated through the basic status endpoint.
- Teacher assignment records mapped to academic year, grade, section and optional curriculum subject.
- Staff document metadata registration with private object-key validation.
- Staff listing, detail, department/designation and assignment APIs.

## Roles and access
All endpoints currently require authenticated School Admin membership. Dedicated HR, principal, department-head and teacher permissions are not implemented. `userId` linking is an optional field only; staff invitation and account provisioning are not implemented.

## Limitations
The admin staff screen is a local preview and does not persist to the API. Binary upload, document verification, payroll, leave, attendance, timetables, substitute allocation, appraisal, onboarding/offboarding automation and background checks remain out of scope for P10.
