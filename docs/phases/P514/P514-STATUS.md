# P514 Status — Billing & Invoice Lifecycle

**Status:** Source implementation complete; focused source assertions and parser checks passed. Local runtime acceptance pending.
**Baseline:** P513 cumulative.

Implemented school fee invoice draft generation from published charges; one invoice per charge; approved concession snapshots; installment-aware itemized lines; amount calculations in integer cents; amountDue reduced by recorded charge payments at invoice creation; scoped list/detail APIs; draft issue lifecycle; reason-required void lifecycle; tenant RLS for invoice and line tables; Finance UI invoice list/create/issue/void actions; audit events.

Invoice numbering is generated and unique per school but is not yet configurable/sequential. Tax/GST, print/PDF, parent/student portal, payment-to-invoice linkage, credit notes, and runtime acceptance remain gaps.
