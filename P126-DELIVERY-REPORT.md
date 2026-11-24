# P126 Delivery Report

P126 adds an auditable refund lifecycle for manually recorded student fee payments. A finance user can request a refund; a separately permissioned approver can approve or reject it; an authorized settlement operator can record externally evidenced settlement. The requestor cannot approve their own request.

Approval is not payment. Only the settlement action updates the fee charge's recorded amount paid and the original payment's refund status. The endpoint explicitly states that it does not transfer funds.

The schema adds refund and append-only event models. The migration adds tenant RLS, composite payment/refund foreign keys, settlement-reference uniqueness, payment status support for partial/full refunds, and a database trigger that rejects update/delete of refund events.

The remaining provider, credit-note and accounting-ledger integrations remain open.
