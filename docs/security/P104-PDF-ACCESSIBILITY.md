# P104 — PDF Accessibility and Font Security

- Fonts are bundled from licensed Noto assets and DejaVu Sans; corresponding license files/manifests ship with the source.
- Fonts are embedded through PDFKit font registration; no external font download occurs during report generation.
- RTL shaping uses the bidi-shaper adapter; logical text is retained as ActualText in structure elements.
- QR and school logo figures include alternative text; decorative lines, fills and page numbering are artifacts.
- Brand colors are checked for at least 4.5:1 contrast against white; otherwise a dark fallback is used.
- Unsupported RTL combinations and CJK text without a bundled font fail explicitly instead of silently emitting missing-glyph boxes.
- PDF download URLs remain short-lived and authorization-scoped; artifact object keys are not exposed.
- P104 does not claim validated PDF/UA compliance. Formal and manual accessibility validation remain required.
