# P11 Access security

- Permission resolution requires active school membership and queries only school-scoped role assignments.
- Role creation accepts only known permission keys; roles are bound to the current organization and school.
- Role assignment requires an active target school membership and a school-scope role.
- Assignment revocation is tenant-filtered.
- Staff account linking requires an existing user with a verified email exactly matching the staff profile email.
- Teacher self-service only exposes the caller's own linked active staff assignments.
- Existing module APIs remain School Admin-only until granular authorization is integrated and regression-tested; no broad permissions are inferred from teacher role membership.
- The current permission catalog is a baseline and requires threat modeling, support-access controls, audit review and policy sign-off before production use.
