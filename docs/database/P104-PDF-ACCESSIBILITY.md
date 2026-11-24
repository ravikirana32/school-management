# P104 — PDF Accessibility Database Changes

Migration: `20261118030000_p104_pdf_accessibility`.

`ReportCardTemplateVersion` adds:
- `layout`: STANDARD, COMPACT or LARGE_PRINT.
- `language`: BCP 47-style document language tag.

`ReportCardPdfArtifact` adds:
- `accessibilityTagged`: whether tagged output was generated.
- `accessibilityProfile`: target/profile label (`PDF/UA-1-TARGET` for P104 output; legacy records default to UNTAGGED).
- `documentLanguage`: document language used during generation.

The migration retains existing artifact rows and marks them untagged rather than assuming older PDFs are accessible.
