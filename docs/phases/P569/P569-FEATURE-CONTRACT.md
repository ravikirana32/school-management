# P569 Feature Contract — Hostel Capacity, Transfers, Waitlist & Checkout

## Capacity
- Aggregate bed status into total, occupied, reserved, available, maintenance, out-of-service and other counts; expose per-building breakdown.

## Transfers
- Require hostel.manage, active school membership and school-scoped active allocation.
- Serialize per-student transfer; validate source/destination bed ownership, destination availability and gender/hostel-type compatibility.
- Claim destination conditionally, move active allocation, release source, append immutable transfer audit and attempt next waitlist offer.

## Waitlist
- One student/year entry per school; priority ascending then creation time.
- Require eligible status to issue offers; validate requested hostel type and preferred building.
- Offers reserve a bed and expire at a configured timestamp; acceptance converts reserved bed to occupied and creates allocation atomically. Decline/expiry releases bed and tries next eligible entry.

## Checkout
- Checklist requires keys, inventory, damage, dues and deposit review.
- Settlement lines are manually entered, typed as charge/refund and independently approved.
- Final approval requires all checklist flags and all settlement lines approved; then allocation closes, bed is released and waitlist offering is attempted.

## Known boundaries
- Parent Mobile status view and guardian notifications are not included. No automatic fee proration, accounting journal, refund payment execution or scheduled offer-expiry worker is included. The existing legacy checkout endpoint remains for backward compatibility until runtime verification proves replacement readiness.
- P569-G001–G010 remain open for runtime, security, accounting, notification and UX acceptance.
