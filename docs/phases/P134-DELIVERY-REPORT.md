# P134 Delivery Report

P134 connects P133's cross-batch historical allocation records to the existing operationalization flow.

A payment can now use a full-value `PAYMENT_TO_CHARGE` allocation to a charge in another posted batch, provided that target charge has already been operationalized. A refund can similarly use a full-value `REFUND_TO_PAYMENT` allocation to an already operationalized payment in another posted batch. Both paths enforce same-school scoping, same student, same currency, posted target batch and transaction date order. Legacy same-batch source references remain supported.

The route rejects multiple/partial allocations for operationalization because each historical source row currently has one `AccountingHistoricalOperationalLink`. It also rejects a cross-batch target without an existing operational link; it does not recursively operationalize batches. Existing historical journals are not posted again.

No schema migration was added. Runtime PostgreSQL verification remains outstanding. Unit/API/browser/mobile test creation and execution remain deferred.
