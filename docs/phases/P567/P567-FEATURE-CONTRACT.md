# P567 Feature Contract — Hostel Visitors & Gate-pass

## Roles and boundaries
- School Admin/hostel warden/gate staff actions are currently authorized through active school membership and `hostel.manage`.
- Read access requires `hostel.read` or School Admin access.
- Every query is scoped by organization and school.
- P567 does not add guardian-facing access or implement P568 leave approval/communications.

## Visitor lifecycle
`PENDING -> APPROVED -> CHECKED_IN -> CHECKED_OUT`
`PENDING -> DENIED | BLOCKED`
`APPROVED -> EXPIRED`

Approval requires a validity window. Gate check-in is rejected outside that window. A visitor cannot check in without an approved pass. Check-out consumes the pass. Duplicate active authorization for the same visitor/resident is rejected.

## Resident outpass lifecycle
`PENDING -> APPROVED -> CHECKED_OUT -> RETURNED`
`PENDING -> DENIED`
`PENDING | APPROVED -> EXPIRED`

An outpass requires an active resident allocation and an already-approved `HostelLeaveRequest` for that same student, organization and school. Its validity must be within the approved leave window. Approval revalidates both records. This intentionally reuses the existing leave workflow; P568 remains responsible for leave requests, guardian communications and return check-in enhancements.

## Privacy
- Store visitor name, optional contact, identity type and identity last four only.
- Never request or store full identity numbers or identity document images in P567.
- Visitor list and resident linkage are available only to authorized school staff; no unverified visitor endpoint exposes student or guardian PII.
