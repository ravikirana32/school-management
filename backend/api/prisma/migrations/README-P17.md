# P17 migration notes

Apply `20261116210000_p17_teacher_membership_discovery` after all earlier migrations.

The migration adds a SELECT-only self-read policy on `SchoolMembership`. It is required because the existing P04 tenant policy requires a known organization ID, while P17 must discover the caller's active school memberships before the client knows which tenant to select. PostgreSQL permissive policies combine with OR; the new policy permits only rows whose `userId` matches the transaction-local `app.current_user_id`. It does not grant write access and does not replace the existing tenant isolation policy.

Verify with two users across two organizations: each user must see only their own membership rows under identity context, and tenant-context read/write policies must remain unchanged.
