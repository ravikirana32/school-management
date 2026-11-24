# P13 API Hardening

No public paths changed. Session open/submit/lock and correction review now use conditional state updates to reject stale concurrent writes. Session listing and student attendance reads also check the attendance entitlement.
