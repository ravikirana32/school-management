# P104 PDF Accessibility Validation Runbook

## Automated validation
1. Generate a published report card in each supported script/layout.
2. Download the PDF using the authorized staff endpoint.
3. Run `verapdf --flavour ua1 <report-card.pdf>`.
4. Save the full JSON/HTML/XML validation report with the report-card artifact ID and build version.
5. Treat `isCompliant=true` as the machine-check result only; veraPDF does not replace manual checkpoints.
6. Run PAC (PDF Accessibility Checker) and record its findings.

## Manual validation
- Inspect document language, title and metadata.
- Verify heading hierarchy and logical reading order.
- Verify subject table header associations and cell reading order.
- Verify logo/QR alternative text and that decorative elements are artifacts.
- Copy/extract Arabic and Hebrew text and confirm logical rather than visual character order.
- Use a screen reader to navigate headings, paragraphs, table rows and figures.
- Check large-print, compact, page-break, long-name and multi-page scenarios.
- Check color contrast and ensure meaning is not conveyed by color alone.

## Script support boundary
Arabic and Hebrew are the supported RTL scripts in P104. Other RTL scripts and mixed RTL+Indic/CJK combinations are rejected with explicit errors. CJK fonts are not bundled. Add licensed font assets and shaping support before enabling those languages.

## Current status
The runbook is not evidence that validation has passed. P104 source tagging is implemented; validator and manual acceptance remain open.
