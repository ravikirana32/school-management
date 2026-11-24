# P568 Next Phase Tasks — Hostel Leave, Guardian Communication & Return Check-in

Roadmap source: `C2-10-ROADMAP.md`. Baseline: P567 cumulative.

## Planned scope
- Resident leave request create/edit/cancel with date/time, purpose and destination/contact policy.
- Warden approval/denial with auditable reason and delegated approval boundaries.
- Guardian consent and notification preference checks before outbound messages.
- Guardian notification event lifecycle, provider adapter integration and delivery/retry observability.
- Approved leave linkage to P567 resident outpass; no duplicate leave or active pass conflicts.
- Expected return monitoring, late-return handling and return check-in verification.
- Guardian-visible leave status only for verified linked guardians with consent/communication permission.
- School Admin/warden/parent mobile workflows, tenant isolation, audit and focused regressions.

## Acceptance boundaries
- Preserve P567 visitor and gate-pass flows.
- Do not expose student/guardian PII to visitors.
- Keep provider delivery claims separate from queued/preview notification records.
- Carry forward Prisma/database/runtime, RLS, permission granularity, mobile, accessibility, concurrency and E2E gaps.
