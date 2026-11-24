# P425 Status — Follow-up Task Monitoring & Overdue Management

**Source status: COMPLETE. Runtime acceptance: PENDING.**

- API supports due-bucket filtering: OVERDUE, DUE_TODAY, UPCOMING, NO_DUE_DATE; completed items excluded from active deadline buckets.
- Coordinator workspace has task count tiles and due-date view filters. Status filtering is applied client-side against the latest loaded task set; coordinator task retrieval cap is 500.
- Teacher Mobile task cards display overdue/due-today labels; completed tasks are not overdue-highlighted.
- P425 verifier 20/20 PASS; modified API/Admin/Mobile files transpile with zero syntax diagnostics.
- Reminders/escalation, timezone policy, pagination/global aggregation and live runtime tests remain gaps.
