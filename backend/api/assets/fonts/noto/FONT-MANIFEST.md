# Noto font asset manifest

These font files are bundled for report-card PDF glyph coverage. The accompanying `LICENSE.txt` is the upstream font license and must be retained with the font assets in source distributions and deployments.

| Script | File |
|---|---|
| Latin | NotoSans-Regular.ttf |
| Arabic glyph coverage (not RTL shaping) | NotoSansArabic-Regular.ttf |
| Bengali | NotoSansBengali-Regular.ttf |
| Devanagari | NotoSansDevanagari-Regular.ttf |
| Gujarati | NotoSansGujarati-Regular.ttf |
| Gurmukhi | NotoSansGurmukhi-Regular.ttf |
| Kannada | NotoSansKannada-Regular.ttf |
| Malayalam | NotoSansMalayalam-Regular.ttf |
| Tamil | NotoSansTamil-Regular.ttf |
| Telugu | NotoSansTelugu-Regular.ttf |

Important: embedding a font does not implement Unicode bidirectional ordering, Arabic joining/shaping, logical reading order, PDF tagging, or screen-reader semantics. The generator rejects Arabic/Hebrew RTL content until a tested shaping pipeline is available. Do not remove this guard based only on glyph coverage.


P104 RTL coverage:
- DejaVu Sans Regular is bundled separately at `../dejavu/DejaVuSans.ttf` for mixed Latin/Hebrew/Arabic text in PDFKit. It is distributed under the Bitstream Vera license; see `../dejavu/LICENSE.txt`.
