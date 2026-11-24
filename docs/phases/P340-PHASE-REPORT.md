# P340 — Admissions Capacity Dashboard

**Status:** Cycle 1 source implementation complete; runtime validation deferred to Cycle 2.

Audited the existing admissions capacities API and School Admin capacity configuration/list. Existing API response already carries capacity, enrolledSeats, and reservedSeats, so no duplicate endpoint or database change was added.

Implemented dashboard KPIs scoped to the currently selected academic year: total configured seats, enrolled seats, reserved seats, and available seats. Section rows show grade/section, counts, utilization percentage, and OPEN/FULL/OVER CAPACITY status, sorted by utilization. An aggregate over-capacity warning highlights excess enrolled plus reserved seats. Empty-state behavior is explicit.

**Remaining:** mobile parity, snapshot freshness semantics, and full runtime/API/database/browser/device/E2E validation in Cycle 2.
