# P79 Remediation Baseline and Status Ledger

## P78 starting inventory (authoritative P78 report)

| Status | Count |
|---|---:|
| OPEN | 254 |
| PARTIALLY_IMPLEMENTED | 97 |
| READY_FOR_VERIFICATION | 108 |
| BLOCKED_EXTERNAL | 12 |
| CLOSED | 0 |
| Total | 471 |

## P79 disposition

- P02-G017 (`GET /auth/me`) source endpoint is implemented; its legacy checklist status is READY_FOR_VERIFICATION pending runtime/API authorization tests.
- P79-G001 and P79-G002 added as READY_FOR_VERIFICATION for API/RLS runtime evidence.
- P79-G003 added as OPEN for web/mobile session bootstrap and tenant-context selection E2E.
- No item is marked CLOSED in P79.

The structured P78 inventory had 471 IDs. P79 adds three structured gap IDs; the status totals below are computed from those 474 structured rows. The older P00–P11 checklist uses a legacy checkbox format and is retained separately; do not mix its line count into this structured inventory total.

| Status | P78 baseline | P79 net change | P79 current |
|---|---:|---:|---:|
| OPEN | 254 | +1 | 255 |
| PARTIALLY_IMPLEMENTED | 97 | 0 | 97 |
| READY_FOR_VERIFICATION | 108 | +2 | 110 |
| BLOCKED_EXTERNAL | 12 | 0 | 12 |
| CLOSED | 0 | 0 | 0 |
| Total | 471 | +3 | 474 |

The status changes are one new OPEN web/mobile integration gap and two new READY_FOR_VERIFICATION runtime evidence gaps. P02-G017's legacy checklist status is updated separately and is not included in the structured 474-row count. The structured register is the phase-to-phase status ledger.
