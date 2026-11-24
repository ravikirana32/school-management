# P567 Next Phase Tasks — Hostel Visitors, Authorized Access & Gate-pass

Roadmap source: `C2-10-ROADMAP.md`.

P567 must build on the P565 cumulative baseline plus P566 and preserve the existing Hostel Workspace and APIs.

## Planned scope
- Visitor registration with identity/contact details and visit purpose.
- Resident/student being visited and host building/room validation.
- Authorized visitor approval and denied/blocked visitor handling.
- Check-in/check-out timestamps and gate staff identity.
- Gate-pass creation, validity window, purpose, approver and lifecycle status.
- Student/resident outpass validation against hostel allocation and applicable leave/permission state.
- Duplicate active visitor pass prevention and expiry handling.
- School Admin/hostel warden/gate staff workflows.
- Tenant/school authorization, audit events, privacy controls and focused regressions.

## Acceptance boundaries
- Do not infer that P567 implements the later P568 leave workflow; integrate only with existing records and preserve the P568 roadmap boundary.
- Do not expose student/guardian PII to unverified visitors.
- Require auditable approval for access that is not covered by an approved policy.
- Carry forward P566 runtime, RLS, notification and mobile gaps.
