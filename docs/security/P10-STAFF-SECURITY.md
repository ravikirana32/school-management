# P10 Staff security and privacy

- All routes authenticate and require active school membership plus School Admin permission.
- Every operation uses tenant context; migration enables and forces RLS on all seven tables.
- Composite FKs prevent cross-tenant department, designation, academic-year, grade, subject and staff references.
- Document object keys reject absolute paths, traversal segments and remote URLs. No binary upload or download is provided.
- Employment, contact, emergency-contact and identity data require role-based field access, retention controls, encryption, access auditing and privacy/legal review before production rollout.
- Status changes are audited. This basic endpoint intentionally blocks reactivation of terminated/resigned records; a controlled rehire workflow is still required.
