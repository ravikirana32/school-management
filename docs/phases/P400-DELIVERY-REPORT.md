# P400 Delivery Report — Campus Configuration Inheritance Foundation

P400 adds a reusable, versioned campus inheritance configuration model and resolver for the profile, weekly working-day and attendance/grading policy scopes. The resolver recursively overlays plain objects, treats arrays as replacement values, preserves explicit `null`, retains base values when no override exists, supports inheritance-disabled behavior, and does not mutate the base object. Prototype-related unsafe keys are ignored. Structural validation rejects invalid document versions/formats, blank campus IDs, self-inheritance, unsupported or duplicate inherited scopes, and unsupported override scopes.

The phase deliberately does **not** claim a full multi-campus feature: persistence, APIs, UI editing, permission integration and inheritance-chain traversal are still open. This is the functional foundation for those later steps.
