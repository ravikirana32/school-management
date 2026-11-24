# P76 — Multilingual PDF Safety and Font Provenance

## Delivered
- Bundled Noto font inventory and license manifest.
- RTL detection and fail-closed behavior for Arabic/Hebrew content.
- Test source for RTL rejection and Indic glyph generation.

## Not delivered
- Unicode bidi algorithm/shaping engine, Arabic contextual joining, tagged PDF structure, PDF/UA conformance, screen-reader reading order or independent visual/accessibility audit.

## Acceptance
Choose and license a maintained shaping implementation; verify mixed-direction Arabic/Latin/numerals/punctuation, extraction order and rendering across PDF viewers; add tagged structure and test with assistive technology before removing the guard.
