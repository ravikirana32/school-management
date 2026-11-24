# P36 homework privacy and tenant security

- Submission records carry organization and school IDs; composite foreign keys ensure the referenced assignment and student belong to the same tenant and school; the assignment composite key also guarantees the submission student is the exact student assigned the homework.
- Forced PostgreSQL RLS requires both transaction-local tenant settings.
- Parent submission first checks the existing active guardian link/consent helper and requires the assignment to be published and assigned to that exact child.
- Parent reads use the same child-link and consent guard as the homework portal; grading feedback is not available through operator list APIs to other tenants.
- Grading and submission listing require `academics.manage`; assign this permission conservatively until teacher assignment row-level authorization is implemented.
- No attachment URL or storage key is accepted by this API. Existing student/staff private document upload and malware scanning are not automatically applicable to homework files.
- Runtime RLS and cross-tenant tests have not been run. Source guards are not proof of runtime isolation.
