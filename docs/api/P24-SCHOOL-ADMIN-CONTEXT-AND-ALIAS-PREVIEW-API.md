# P24 API — School Admin Context & Room Alias Preview

## GET `/api/v1/organizations/me/schools`

Authentication: Bearer access token.

Returns active school memberships for the authenticated user, with organization and school labels. The request accepts no organization or school ID. Membership resolution uses identity context, then each school is resolved inside its tenant context. Maximum 200 memberships; response metadata indicates possible truncation.

## GET `/api/v1/schools/:organizationId/:schoolId/academic-years`

Existing authenticated school configuration endpoint. Requires active school membership and returns academic years ordered by start date descending. P24 reuses it for the School Admin academic-year selector.

## GET `/:organizationId/:schoolId/timetable/rooms/aliases/:aliasId/preview`

Authentication and authorization: active school membership plus School Admin access.

Read-only response fields:

- Alias label, status and canonical room code.
- Target room and `validTarget` flag.
- Exact total and active counts for matching timetable slots and exceptions.
- `canApply` only when alias is approved and target room is active.
- `destructive: false`.

Matching uses normalized lowercase, trimmed legacy room labels, consistent with the apply operation. The preview does not reserve rows or guarantee that the same counts will remain at apply time.

## Alias maker-checker behavior

- Creator cannot approve their own alias; a different authorized School Admin must approve.
- Create, approve and apply write actor-attributed audit events in the same transaction as the alias operation.
- Apply still requires `APPROVED`, revalidates active target room, acquires the school-wide advisory lock, and recalculates committed update counts.

## Error responses

- `401`: missing/invalid authentication.
- `403`: membership/admin denial or self-approval attempt.
- `404`: alias not found.
- `409`: duplicate or invalid state/target room.
- `400`: invalid request data.
