# P33 data model

`StudentFeeCharge` owns a student's published charge; `StudentFeePayment` stores manual reconciliation entries with a unique per-charge reference. `HomeworkAssignment` and `StudentReportCard` are student-scoped, draft/published lifecycle records. `ParentNotification` is a per-recipient school notification. All tables have tenant keys, composite student references where applicable, indexes and forced RLS.

The schema intentionally does not infer fee allocation from organization subscription invoices. School tuition and ancillary fees are separate student ledger records. Online gateway, refunds, accounting exports and receipt generation remain future work.
