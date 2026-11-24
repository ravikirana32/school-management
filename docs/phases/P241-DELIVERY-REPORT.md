# P241 Delivery Report — Configured-section enrollment preflight guard

## Implemented
- Reuses the selected grade/year configured-section capacity list as the enrollment preflight snapshot.
- Blocks submit when a configured-capacity grade/year is in use but the chosen section is not present in that configuration.
- Blocks submit when the selected configured section has zero calculated available seats.
- Provides clear feedback and leaves the backend's atomic capacity check as the authoritative protection against stale snapshots/concurrency.
- Legacy manual-section behavior remains when no capacity configuration is present.

## Static source checks
1. Grade/year filtered section-capacity snapshot helper exists.
2. Selected section is matched against the filtered configured options.
3. Available seat count is calculated using capacity minus enrolled and reserved seats.
4. Enrollment submission preflight rejects missing configured section.
5. Enrollment submission preflight rejects zero-seat section.
6. Legacy fallback path remains present.

Build, typecheck, runtime/API, browser, security, mobile, and E2E validation remain deferred as requested.
