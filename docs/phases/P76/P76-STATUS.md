# P76 Status — Multilingual PDF Safety and Font Provenance

**Status: DEFENSIVE SOURCE CHANGE DELIVERED; RTL/TAGGED PDF STILL OPEN**

- Added font asset manifest and retained upstream license reference.
- Added an explicit Arabic/Hebrew RTL detection guard; the PDF generator now rejects unsupported RTL content rather than emitting potentially misordered output.
- Added test source for RTL rejection while retaining Indic-script PDF generation.

This phase does not implement Arabic bidi shaping, tagged PDF, logical reading order or screen-reader semantics. It prevents a known unsupported path from silently producing a misleading document.
