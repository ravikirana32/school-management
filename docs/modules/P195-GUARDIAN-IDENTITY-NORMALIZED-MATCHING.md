# P195 — Guardian Identity Normalized Matching

## Scope
Strengthen admission-to-student conversion guardian matching by comparing normalized contact keys, avoiding silent merges, and retaining the ambiguous-match conflict behavior.

## Source changes
- Conversion now loads active guardians only within the current organization and school, then uses the shared normalized identity helper to compare email and phone keys.
- Email normalization trims and lowercases.
- Phone normalization strips punctuation and whitespace, preserves a leading plus sign, and does not infer country codes or match partial suffixes.
- New guardian records use normalized contact values.
- Multiple matches remain a `409 GUARDIAN_MATCH_AMBIGUOUS` response and must be resolved manually; single match reuses, no match creates.
- Matching never crosses organization/school scope and inactive guardians are excluded.

## Known limitation
The conversion currently enumerates active guardians in the school to perform normalized matching. This should be replaced with indexed normalized-contact columns or a dedicated normalized identity-key table for scale. Guardian collision resolution UI remains open.

## Validation
Source-level review only. Build, typecheck, tests, runtime, concurrency and performance acceptance are deferred to the dedicated validation phases.
