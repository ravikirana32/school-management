# P115 Delivery Report

P115 adds progressive login protection scoped to the normalized account and source-IP pair. Five failures in a 15-minute window trigger a 60-second cooldown; eight or more trigger a five-minute cooldown. The response remains a generic 401, and successful login clears the pair's counters. The pair is SHA-256 digested before use in Redis keys to avoid storing raw email/IP values.

P115 also emits threshold-deduplicated security alert events into a Redis Stream. Alerts cover repeated failed logins, rate-limit denials, refresh-token reuse, concurrent refresh reuse and progressive cooldown activation. The existing platform-admin-only summary returns at most 50 recent events with fixed event names, aggregate counts and timestamps. Stream and dedupe retention is 35 days.

This is event generation, not alert delivery: no external provider, on-call integration or dashboard is configured. Cooldowns are account+IP scoped, not global account locks, to reduce third-party account-lockout denial-of-service risk. No MFA/adaptive challenge is claimed.

Gap changes: P113-G002 and P114-G001 remain PARTIALLY_IMPLEMENTED with narrower descriptions; P114-G002 remains READY_FOR_VERIFICATION; P114-G003 moves from OPEN to PARTIALLY_IMPLEMENTED. P115-G001 is READY_FOR_VERIFICATION, P115-G002 is OPEN, and P115-G003 is READY_FOR_VERIFICATION. No gaps are closed because runtime evidence is not available.
