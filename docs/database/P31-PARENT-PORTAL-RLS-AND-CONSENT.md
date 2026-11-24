# P31 Parent Portal Database & RLS

## Schema changes
- `ParentInvitation.consentNoticeText VARCHAR(4000) NOT NULL` stores the exact notice presented for the invitation version.
- `ParentInvitation.consentWithdrawnAt TIMESTAMP NULL` records withdrawal without deleting the acceptance history.
- Added indexes for guardian-by-user/school, accepted invitation lookups, visible student-guardian links and parent attendance history.
- Added SELECT/UPDATE RLS policy for parent invitation delivery worker context.
- Added SELECT RLS policies for student/staff document scan worker context, restricted to QUARANTINED records.

## Parent acceptance transaction
1. Token hash lookup resolves tenant using the possession-based P30 policy.
2. Tenant transaction obtains invitation advisory lock and checks PENDING, expiry and consent version.
3. Existing account password is verified, or a new user is created.
4. Guardian account link and verified email are recorded.
5. OrganizationMembership and SchoolMembership are activated.
6. PARENT role assignment is created if absent.
7. Invitation is marked ACCEPTED, consent timestamp is stored, encrypted delivery payload is erased and audit event is inserted.

## Consent withdrawal
- `consentWithdrawnAt` is set for accepted invitations in the selected school.
- School-managed `canReceiveCommunications` preferences are preserved; access is denied by the withdrawn consent and removed parent role/membership.
- SchoolMembership becomes LEFT and school-scoped PARENT role assignment is deleted.
- Organization membership becomes LEFT only if no other active school membership remains.
- Audit event is written in the same tenant transaction.

## RLS notes
P31 worker policies use transaction-local service GUCs. They are intended only for separate worker processes. Production must separate DB credentials and restrict worker access; test both policy behavior and non-owner role grants. No RLS or migration runtime claim is made until PostgreSQL integration evidence exists.
