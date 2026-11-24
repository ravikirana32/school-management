# P104 Delivery Report

P104 updates report-card PDF generation and administration for accessible, multilingual output.

Implemented:
- Tagged PDF generation configured for PDF/UA-1 target with language/title metadata.
- Reading-order structure tree: Document, Sect, H1/H2, P, Table/TR/TH/TD and Figure.
- ActualText preserves logical text for RTL paragraphs; decorative content and pagination are artifacts.
- School logo and verification QR have Figure alternative text and bounding boxes.
- Arabic/Hebrew bidirectional shaping through bidi-shaper and bundled DejaVu Sans; script-specific Noto font runs for supported supported Indic scripts.
- Brand color contrast is checked and unsafe light colors fall back to a high-contrast dark color.
- Standard, compact and large-print layouts plus BCP 47 language settings.
- Versioned template creation/activation and staff PDF download with accessibility metadata.
- PDF artifact records retain tagged/profile/language metadata.

No formal PDF/UA compliance is claimed until veraPDF/PAC and manual assistive-technology review are complete. User-requested test creation/execution remains deferred.
