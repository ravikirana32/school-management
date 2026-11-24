# P30 Database Changes

Migration: `20261117120000_p30_parent_documents_employment`.

- Guardian: optional linked `User`, email/phone verification timestamps and `mergedIntoGuardianId` self-reference scoped to the same organization/school.
- ParentInvitation: tenant-scoped, forced-RLS table with unique token hash, consent version/acceptance timestamp, expiry/status, encrypted AES-GCM delivery fields and delivery queue state. Partial unique index allows one pending invitation per guardian.
- StudentDocument and StaffDocument: `DocumentSecurityStatus` (`PENDING_UPLOAD`, `QUARANTINED`, `CLEAN`, `REJECTED`).
- SELECT-only RLS lookup policies allow a token-hash possession lookup or signed scanner lookup to discover tenant scope; subsequent reads/writes re-enter the regular tenant context.
- StaffEmploymentHistory: migration aborts if any existing staff member has overlapping inclusive date ranges; then adds a GiST exclusion constraint on staff member plus `daterange(startsOn, endsOn, '[]')` using `btree_gist`.

The migration intentionally does not repair overlapping employment history. Production deployment must run the preflight on a restored production snapshot and resolve all conflicts before applying the exclusion constraint.
