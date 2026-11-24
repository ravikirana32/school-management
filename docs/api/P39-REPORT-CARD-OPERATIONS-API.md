# P39 report-card operations API additions

All routes require bearer authentication, active school membership and tenant context.

| Method | Path suffix | Permission | Purpose |
|---|---|---|---|
| GET | `/report-cards?limit=50&approvalStatus=PENDING_APPROVAL` | `reports.read` | List report cards (limit capped at 100), student identity and approval event timeline |
| GET | `/report-card-schemas` | `reports.read` | List schema versions |
| POST | `/report-card-schemas` | `reports.manage` | Create schema draft |
| POST | `/report-card-schemas/:id/activate` | `reports.approve` | Activate schema draft |
| POST | `/report-cards/:id/approve` | `reports.approve` | Approve/reject pending report; rejection reason required |
| POST | `/report-cards/:id/publish-versioned` | `reports.manage` | Generate private PDF and publish approved report |
| GET | `/portal/report-cards/:id/download` | `parent.reports.read` | Consent-checked short-lived PDF URL |

The school-admin UI uses the existing schema/approval/publish routes and the new bounded list endpoint. The parent mobile app calls the existing portal download endpoint; it never receives a storage key.
