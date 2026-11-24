# P09 Admissions security and privacy

- All routes authenticate and require active school membership plus School Admin access.
- Reads/writes use tenant transaction context; migration enables and forces RLS for each admissions table.
- Document object keys reject absolute paths, traversal segments and HTTP(S) URLs. This is metadata validation, not an upload implementation.
- Guardian contact details and child data are sensitive. Production rollout requires retention/deletion policy, consent and privacy notices, encryption/key management, audit access review, rate limiting, and verified storage access controls.
- Application conversion is transactional and unique convertedStudentId prevents one student being linked to multiple applications; concurrency and DB constraints still require runtime verification.
