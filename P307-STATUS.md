# P307 Status — Rollover Capacity Validation & Conflict Prevention

Status: **Delivered — static checks passed**

Implemented an advisory capacity preflight in the School Admin academic-year rollover preview. The helper groups valid rows by target academic year, grade and normalized section, calculates seats available after enrolled and reserved seats, and blocks eligible rows if aggregate demand exceeds configured availability. Invalid candidates do not consume seats; missing capacity configuration is not interpreted as zero capacity.

P307 verifier: **7/7 PASS**. Selected regressions: P306 12/12, P305 9/9, P304 15/15, P303 13/13, P73 10/10, P79 9/9, P302 9/9. Runtime/build/browser/mobile validation not run.

Open: API-side atomic capacity reservation/revalidation, full-directory lookup, dependency-backed build and runtime acceptance.
