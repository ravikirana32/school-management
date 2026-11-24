# P09 Admissions API

Base path: `/api/v1/:organizationId/:schoolId/admissions` (authenticated School Admin membership required).

| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/enquiries` | List/create enquiries |
| GET/POST | `/applications` | List/create draft applications |
| POST | `/applications/:applicationId/transition` | Move application through allowed stages |
| POST | `/applications/:applicationId/documents` | Register private document metadata |
| GET/POST | `/capacities` | List/upsert grade-section capacity |
| POST | `/applications/:applicationId/offers` | Create an offer for an approved application |
| POST | `/offers/:offerId/respond` | Record acceptance or decline |
| POST | `/applications/:applicationId/convert` | Convert accepted application to student records |

List endpoints currently cap results at 100 and do not yet expose full pagination. Request/response contracts are represented in route validation; OpenAPI registration remains pending. No raw document upload route is exposed.
