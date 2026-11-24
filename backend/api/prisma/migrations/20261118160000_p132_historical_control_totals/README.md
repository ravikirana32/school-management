# P132 historical financial controls migration

Adds optional operator-declared charge, payment and refund control totals to historical import batches. All three totals and the verification timestamp must be present together, and totals must be non-negative. The API validates exact minor-unit equality at draft creation and repeats the comparison during independent approval.

The migration is additive. It does not rewrite legacy rows, alter existing journals, infer source totals or certify source authenticity. Totals are operator assertions, not cryptographic signatures. Apply using the normal Prisma migration deployment process after reviewing the target database and taking the standard backup.
