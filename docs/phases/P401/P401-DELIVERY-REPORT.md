# P401 Delivery Report — Campus Inheritance Chain Resolution

P401 adds a deterministic, validated root-to-campus inheritance-chain resolver on top of P400's merge and document validation foundation.

### Behavior
- Builds a campus-ID index from valid documents; duplicate IDs fail validation.
- Rejects malformed documents, missing campus, missing parent and inheritance cycles.
- Resolves ancestor configuration first, then progressively applies child overrides.
- For each scope, inherited scopes recursively merge; scopes not marked inherited replace with the campus override.
- Returns validation errors and the resolved chain; invalid resolution does not return a configuration.

This phase does not wire campus inheritance into persistent campus records, backend APIs, permission checks, or UI.
