# P131 Delivery Report

P131 extends the P130 historical import workflow into the operational fee subledger. The batch must already be POSTED to accounting before operationalization. Historical charge rows become operational fee charges; payment rows require an explicit charge source reference; refund rows require an explicit payment source reference and external settlement evidence.

Operationalization is a separate permission-gated transaction. It creates `StudentFeeCharge`, `StudentFeePayment`, `StudentFeeRefund` and `StudentFeeRefundEvent` records, and records immutable source-to-operational links. It deliberately does not call the accounting posting hooks because P130 has already posted the historical journals.

The School Admin Finance workspace includes the action and linkage completeness summary. Source code verification is not database/runtime acceptance.
