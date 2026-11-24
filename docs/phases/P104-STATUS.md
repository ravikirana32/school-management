# P104 Status — PDF Accessibility and Multilingual Layouts

Status: TAGGED PDF/UA-TARGET SOURCE IMPLEMENTED; FORMAL CONFORMANCE AND SCREEN-READER ACCEPTANCE DEFERRED.

## Delivered source
- Upgraded the API PDF renderer to PDFKit 0.20.2 and added the `bidi-shaper` PDFKit adapter.
- Generated PDFs use tagged PDF structure, PDF/UA-1 target mode, document language metadata, display title and PDF 1.7.
- Added a logical `Document`/`Sect` structure tree with H1/H2 headings, paragraphs, a semantic Table/TR/TH/TD assessment table and Figure alternatives for school logo and verification QR.
- Marked decorative backgrounds, separators and page numbering as artifacts.
- Added `ActualText` with logical source strings so Arabic/Hebrew visual reordering does not replace logical reading text.
- Added Arabic/Hebrew RTL handling using bundled DejaVu Sans, including mixed Latin labels and RTL values.
- Added script-specific Noto font runs for Devanagari, Bengali, Gurmukhi, Gujarati, Tamil, Telugu, Kannada and Malayalam.
- Unsupported RTL combinations and CJK text without a bundled CJK font fail with explicit errors rather than silently rendering tofu.
- Added contrast-safe brand colors; headings/body text are not distinguished by color alone.
- Added STANDARD, COMPACT and LARGE_PRINT layouts.
- Added BCP 47 document language selection to legacy and versioned report-card templates.
- Added versioned template creation/activation UI and staff PDF download UI with tagged/language metadata.
- Added `accessibilityTagged`, `accessibilityProfile` and `documentLanguage` to PDF artifact records.
- Added licensed DejaVu Sans font asset and license manifest.

## API changes
- `PUT /:organizationId/:schoolId/report-card-template` accepts `layout` and `language`.
- `POST /:organizationId/:schoolId/report-card-templates` accepts `layout` and `language`.
- `GET /:organizationId/:schoolId/report-cards` includes latest PDF accessibility metadata.
- `GET /:organizationId/:schoolId/report-cards/:reportCardId/pdf` returns a short-lived signed download URL and accessibility metadata for published reports.
- Parent PDF download response also includes accessibility metadata.

## Conformance boundary
The generator is configured to create tagged PDFs targeting PDF/UA-1, but P104 does not claim formal PDF/UA compliance. veraPDF/PAC validation, manual reading-order review and assistive-technology acceptance have not been run.

## Deferred by user direction
Unit tests, API integration tests, browser E2E and test-case creation/execution remain deferred to later validation phases.

## Known limitations
- Arabic and Hebrew are supported RTL scripts. Syriac, Thaana, N'Ko, mixed RTL+Indic and CJK combinations fail closed until licensed fonts and shaping coverage are added.
- Indic bundled Noto script support uses font runs; visual layout and extraction need language-by-language validation.
- PDF/UA tagging/structure is source-implemented but not formally validated.
- PDF generation with large-print and multi-page tables needs visual/manual review.
