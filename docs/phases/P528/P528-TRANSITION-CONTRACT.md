# P528 Transition Preflight Contract

GET `/:organizationId/:schoolId/admissions/applications/:applicationId/transition-options` requires `admissions.read` within the existing membership and entitlement scope.

Response data:
- `application`: id, applicationNumber, current status, updatedAt
- `allowedTransitions`: values from the shared server transition map for current status
- `terminal`: true for CONVERTED, REJECTED, WITHDRAWN
- `recentHistory`: up to 10 newest status-history records

Stable codes added or enriched for transition blockers: `ADMISSION_APPLICATION_NOT_FOUND`, `ADMISSION_TRANSITION_NOT_ALLOWED`, `ADMISSION_DECISION_NOTE_REQUIRED`, `ADMISSION_RULES_NOT_CONFIGURED`, `ADMISSION_REQUIRED_DOCUMENTS_INCOMPLETE`, `ADMISSION_DATE_OF_BIRTH_REQUIRED`, `ADMISSION_AGE_BELOW_MINIMUM`, `ADMISSION_AGE_ABOVE_MAXIMUM`, and existing `ADMISSION_TRANSITION_CONFLICT`.
