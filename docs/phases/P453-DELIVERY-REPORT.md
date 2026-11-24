# P453 Delivery Report

P453 implements teacher-mobile client integration for the existing paginated in-app communications inbox.

- The API helper gained an opt-in response-envelope mode; legacy API calls still return `data.data`.
- The teacher announcement inbox consumes `pagination.nextCursor`, `pagination.hasMore`, and server `unreadCount`.
- A Load more button fetches continuation pages and deduplicates notification IDs before append.
- Read-one updates the unread count without decrementing an already-read item.
- Refresh restarts from the first page and resets paging state.
- Offline/loading guardrails are applied to pagination UI.

No backend route, database model, or migration was added in P453.
