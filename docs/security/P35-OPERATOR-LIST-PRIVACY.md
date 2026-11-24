# P35 — Operator List Privacy & Cursor Security

- Cursor IDs are not bearer authorization tokens. Each is validated against the authenticated tenant/school and active filters before the list query.
- The list query independently retains tenant and school predicates; RLS remains mandatory defense in depth.
- `limit` is bounded to 100 to avoid unbounded response sizes.
- Stable `createdAt DESC, id DESC` ordering avoids nondeterministic ordering for equal timestamps.
- Notifications do not expose `recipientUserId`, email or phone fields. The current API still returns one notification row per recipient; recipient-batch aggregation and unread counters are future work.
- Fee payment reference and method remain visible only to callers with the existing `fees.read` permission.
- Cursor pagination is not a snapshot. Concurrent insertions/deletions/updates can affect page membership; tests and an explicit snapshot/watermark strategy remain open.
