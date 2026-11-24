# P399 Delivery Report — Strict Calendar Timestamp Validation

P399 hardens school calendar configuration import by replacing permissive date parsing for event start/end values with strict ISO 8601 date-time validation requiring an explicit timezone.

The validator accepts UTC (`Z`) and numeric timezone offsets, with optional millisecond precision. It rejects missing timezone, date-only values, invalid calendar dates (including rollover dates), invalid clock components, and out-of-range timezone offsets. Event end time must not precede the validated start time.

A verifier was added at `scripts/verify-p399-calendar-iso-timezone.mjs` and exposed as `verify:p399`.

This is a targeted import validation improvement; it does not provide transactionality or close F03.
