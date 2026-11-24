# P173 Admissions API extensions

All routes are tenant/school scoped and require authenticated active school membership, the relevant admissions permission, and an active subscription entitlement.


## Enquiries and applications
- `GET/POST /api/v1/:organizationId/:schoolId/admissions/enquiries`
- `POST /api/v1/:organizationId/:schoolId/admissions/enquiries/:enquiryId/convert`
- `GET/POST /api/v1/:organizationId/:schoolId/admissions/applications`
- `POST /api/v1/:organizationId/:schoolId/admissions/applications/:applicationId/transition`
- `GET /api/v1/:organizationId/:schoolId/admissions/applications/:applicationId/history`

## Offers and enrollment
- `POST /applications/:applicationId/offers` creates offer from APPROVED state and advances application to OFFERED.
- `GET /offers` lists tenant-school offers.
- `POST /offers/:offerId/respond` accepts or declines an OFFERED record and advances application state.
- `POST /applications/:applicationId/convert` converts ACCEPTED application into student, guardian link and enrollment; if a configured section capacity exists, a conditional atomic seat increment occurs in the transaction.

## Secure admission documents
1. `POST /applications/:applicationId/documents/upload` accepts document type, name, MIME, size and required flag; creates private quarantine key and presigned upload form.
2. Client uploads directly to the presigned storage endpoint.
3. `POST /applications/:applicationId/documents/:documentId/complete` verifies object metadata, sets QUARANTINED/RECEIVED and queues scanner.
4. Scanner callback supports `kind=admission`; clean objects are promoted to private storage and status becomes CLEAN/RECEIVED. Rejected or MIME-mismatched objects become REJECTED.
5. `POST /applications/:applicationId/documents/:documentId/review` permits VERIFIED only after CLEAN scanner status.
6. `GET /applications/:applicationId/documents/:documentId/download` returns a short-lived signed URL only for CLEAN+VERIFIED documents.
- `GET /applications/:applicationId/documents` lists tenant-scoped document metadata without exposing object keys.
- Upload allowlist: PDF, JPEG, PNG; maximum 25 MB.

## Capacity
- `GET/POST /capacities` reads and configures academic-year/grade/section capacity.
- `GET /capacities/availability` returns capacity, reserved/enrolled counts and available seat calculation.
- Enrollment conversion uses an atomic conditional increment when a matching section-capacity row exists; missing capacity records currently remain permissive and are tracked as a gap.

Builds and runtime validation are intentionally deferred for this phase.
