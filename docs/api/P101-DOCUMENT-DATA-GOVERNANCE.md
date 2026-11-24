# P101 — Document and Data Governance API

All endpoints are mounted under `/api/v1/:organizationId/:schoolId` and require an authenticated active school membership plus `school.settings.manage`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/governance/requests` | List up to 100 most recent data-subject requests |
| POST | `/governance/requests` | Register ACCESS, EXPORT, ERASURE or CORRECTION request for a school-scoped student, guardian or staff record |
| POST | `/governance/requests/:requestId/review` | Move REQUESTED → UNDER_REVIEW / APPROVED / REJECTED, or UNDER_REVIEW → APPROVED / REJECTED |
| GET | `/governance/legal-holds` | List legal holds |
| POST | `/governance/legal-holds` | Place a hold on a student, staff or homework document |
| POST | `/governance/legal-holds/:holdId/release` | Release an active hold with a mandatory reason |
| GET | `/governance/retention-policies` | List school retention policies |
| POST | `/governance/retention-policies` | Create/update a bounded retention policy |
| GET | `/governance/retention-preview` | List CLEAN documents older than configured retention; excludes active holds |
| GET | `/governance/consent-events` | List consent acceptance/withdrawal history |

## Safety boundaries
- Request subject IDs are validated against the selected tenant and school.
- Legal hold target IDs are validated against the selected tenant and school.
- Duplicate active legal holds return the existing hold.
- Retention preview is non-destructive and returns `automaticDeletion: false`.
- APPROVED requests cannot be marked COMPLETED until real fulfilment and evidence workflows exist.
- The API does not generate exports or erase records in P101.
