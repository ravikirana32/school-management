# P03 — Platform Super Admin

## Scope delivered in source
- Platform-only API guard checks the authenticated user identity's `isPlatformAdmin` flag.
- Dashboard aggregate counts for organizations, schools, users and suspension lifecycle events.
- Paginated/searchable organization listing.
- Organization creation and detail retrieval.
- Organization status lifecycle updates with mandatory reason and lifecycle/audit records.
- School creation within an existing organization.
- Platform settings read (secrets excluded) and JSON value upsert.
- Time-bounded support access grant records, capped at four hours, with audit event.
- Initial Super Admin console view for dashboard counts and organization list.

## API
Base path: `/api/v1/platform`; every route requires P02 authentication and platform-admin identity.
- `GET /dashboard`
- `GET /organizations?page=&pageSize=&search=`
- `POST /organizations`
- `GET /organizations/:organizationId`
- `PATCH /organizations/:organizationId/status`
- `POST /organizations/:organizationId/schools`
- `POST /support-access-grants`
- `GET /settings`
- `PUT /settings/:key`

## Safety limitations
- The current lifecycle persistence adds an event record and toggles `Organization.isActive`; the P02 Organization model does not yet have a full lifecycle status column. Deactivated and archived states therefore need a richer state model before operational use.
- Support grant records do not yet enable impersonation or tenant data access. Self-scoped grant creation is a deliberately restricted placeholder, not a functioning break-glass workflow.
- Platform settings are generic JSON configuration; secret values are excluded from list results but encrypted secret storage and a secret-management integration are not implemented.
- Dashboard suspension count is lifecycle-event count, not a deduplicated count of currently suspended tenants.
- Organization creation does not yet provision an initial organization owner or school admin.
- Super Admin UI uses a pasted access token as a temporary integration surface; production login and secure token handling are not complete.
