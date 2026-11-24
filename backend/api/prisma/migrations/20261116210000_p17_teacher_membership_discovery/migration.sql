-- P17: allow an authenticated identity to discover only its own active/inactive
-- school membership rows. Existing tenant policy remains in force for tenant work.
-- PostgreSQL permissive policies combine with OR; this SELECT policy does not
-- grant INSERT/UPDATE/DELETE access and exposes no other user's memberships.
CREATE POLICY "school_membership_self_read"
  ON "SchoolMembership"
  FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));
