import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { detectDirection, render as renderBidi } from "bidi-shaper";
import { textBidi } from "bidi-shaper/pdfkit";
import { fileURLToPath } from "node:url";

export type ReportCardPdfInput = {
  schoolName: string;
  schoolAddress?: string | null;
  schoolLogo?: Buffer | null;
  studentName: string;
  admissionNumber: string;
  className?: string | null;
  term?: string;
  termName?: string;
  academicYear: string;
  generatedAt?: Date;
  publishedAt?: Date;
  subjects: Array<{ name: string; marks: string; grade?: string | null }>;
  teacherRemarks?: string | null;
  principalRemarks?: string | null;
  remarks?: string | null;
  footerText?: string | null;
  signatureLabel?: string | null;
  verificationCode?: string;
  verificationUrl?: string;
  brandColor?: string | null;
  language?: string | null;
  layout?: "STANDARD" | "COMPACT" | "LARGE_PRINT";
};

const fontPath = (name: string) => fileURLToPath(new URL(`../../../assets/fonts/noto/${name}`, import.meta.url));
const rtlFontPath = fileURLToPath(new URL("../../../assets/fonts/dejavu/DejaVuSans.ttf", import.meta.url));

const RTL_SUPPORTED = /[\u0590-\u05ff\u0600-\u06ff\ufb1d-\ufb4f\ufb50-\ufdff\ufe70-\ufeff]/u;
const RTL_ANY = /[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufeff]/u;
const RTL_UNSUPPORTED = /[\u0700-\u08ff]/u;
const INDIC_SCRIPT = /[\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Oriya}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Thai}\p{Script=Lao}\p{Script=Tibetan}\p{Script=Myanmar}\p{Script=Khmer}\p{Script=Balinese}\p{Script=Sundanese}\p{Script=Batak}\p{Script=Lepcha}\p{Script=Ol_Chiki}\p{Script=Syloti_Nagri}\p{Script=Phags_Pa}\p{Script=Saurashtra}\p{Script=Kayah_Li}\p{Script=Rejang}\p{Script=Javanese}\p{Script=Cham}\p{Script=Tai_Viet}]/u;
const UNSUPPORTED_FONT_SCRIPT = /[\p{Script=Oriya}\p{Script=Sinhala}\p{Script=Thai}\p{Script=Lao}\p{Script=Tibetan}\p{Script=Myanmar}\p{Script=Ethiopic}\p{Script=Khmer}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Bopomofo}\p{Script=Hangul}]/u;

export function containsUnsupportedRtl(value: string) {
  return RTL_ANY.test(value) && (RTL_SUPPORTED.test(value) || RTL_UNSUPPORTED.test(value) || INDIC_SCRIPT.test(value));
}

function containsRtl(value: string) {
  return RTL_SUPPORTED.test(value);
}

function fontForCodePoint(char: string) {
  const cp = char.codePointAt(0) || 0;
  if ((cp >= 0x0900 && cp <= 0x097f) || (cp >= 0xa8e0 && cp <= 0xa8ff)) return "Devanagari";
  if (cp >= 0x0980 && cp <= 0x09ff) return "Bengali";
  if (cp >= 0x0a00 && cp <= 0x0a7f) return "Gurmukhi";
  if (cp >= 0x0a80 && cp <= 0x0aff) return "Gujarati";
  if (cp >= 0x0b80 && cp <= 0x0bff) return "Tamil";
  if (cp >= 0x0c00 && cp <= 0x0c7f) return "Telugu";
  if (cp >= 0x0c80 && cp <= 0x0cff) return "Kannada";
  if (cp >= 0x0d00 && cp <= 0x0d7f) return "Malayalam";
  return "Latin";
}

function splitFontRuns(value: string): Array<{ text: string; font: string }> {
  const chars = Array.from(value);
  const scripts = chars.map(char => {
    if (/^\s$/u.test(char) || /^[\p{P}\p{S}\p{N}]$/u.test(char)) return null;
    return fontForCodePoint(char);
  });
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i]) continue;
    scripts[i] = scripts.slice(i + 1).find(Boolean) || scripts.slice(0, i).reverse().find(Boolean) || "Latin";
  }
  const runs: Array<{ text: string; font: string }> = [];
  for (let i = 0; i < chars.length; i++) {
    const font = scripts[i] || "Latin";
    const last = runs[runs.length - 1];
    if (last && last.font === font) last.text += chars[i];
    else runs.push({ text: chars[i], font });
  }
  return runs;
}

function contrastRatio(hex: string, background = "#FFFFFF") {
  const luminance = (value: string) => {
    const normalized = value.replace("#", "");
    const channels = [0, 2, 4].map(offset => parseInt(normalized.slice(offset, offset + 2), 16) / 255)
      .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  try {
    const a = luminance(hex), b = luminance(background);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  } catch { return 1; }
}

function accessibleBrandColor(input?: string | null) {
  const value = /^#[0-9a-fA-F]{6}$/.test(input || "") ? input! : "#1F3B5B";
  return contrastRatio(value) >= 4.5 ? value : "#1F2937";
}

function addText(doc: any, children: any[], logicalText: string, options: any, tag: "H1" | "H2" | "P" = "P", language = "en-IN") {
  const text = String(logicalText ?? "");
  if (!text) return;
  if (containsUnsupportedRtl(text)) throw Object.assign(new Error("This PDF cannot safely render right-to-left or mixed RTL/complex-script text. Choose a left-to-right template language."), { code: "RTL_PDF_UNSUPPORTED" });
  if (UNSUPPORTED_FONT_SCRIPT.test(text)) throw Object.assign(new Error("A licensed font pack is not bundled for one or more scripts in this report card."), { code: "PDF_FONT_SCRIPT_UNSUPPORTED" });
  const fontSize = Number(options.fontSize || 9);
  const content = doc.markStructureContent(tag);
  if (containsRtl(text)) {
    doc.font("RTL").fontSize(fontSize).fillColor(options.fillColor || "#111827");
    const direction = detectDirection(text);
    const x = options.x ?? doc.x;
    const y = options.y ?? doc.y;
    const drawOptions = { ...options, x: undefined, y: undefined, align: options.align || (direction === "rtl" ? "right" : "left"), bidi: { direction: "auto", paragraphs: "split" } };
    textBidi(doc, `${text} `, x, y, drawOptions);
  } else {
    const runs = splitFontRuns(text);
    runs.forEach((run, index) => {
      doc.font(run.font).fontSize(fontSize).fillColor(options.fillColor || "#111827");
      const runOptions = { ...options, continued: index < runs.length - 1 };
      if (index > 0) { delete runOptions.x; delete runOptions.y; }
      doc.text(run.text + (index === runs.length - 1 ? " " : ""), runOptions);
    });
  }
  doc.endMarkedContent();
  children.push(doc.struct(tag, { actual: text, lang: language }, [content]));
}

function drawArtifact(doc: any, draw: () => void, type: "Layout" | "Pagination" = "Layout") {
  doc.markContent("Artifact", { type });
  draw();
  doc.endMarkedContent();
}

function addFigure(doc: any, children: any[], alt: string, bbox: number[], draw: () => void) {
  const content = doc.markStructureContent("Figure");
  draw();
  doc.endMarkedContent();
  children.push(doc.struct("Figure", { alt, bbox }, [content]));
}

function measureText(doc: any, value: string, width: number, size: number) {
  if (containsRtl(value)) {
    const visual = renderBidi(value);
    return doc.heightOfString(visual, { width, font: "RTL", fontSize: size, features: [] });
  }
  const runs = splitFontRuns(value);
  const totalWidth = runs.reduce((sum, run) => sum + doc.widthOfString(run.text, { font: run.font, fontSize: size }), 0);
  const lineHeight = doc.currentLineHeight(true);
  return Math.max(lineHeight, Math.ceil(totalWidth / Math.max(1, width)) * lineHeight);
}

function addTableCell(doc: any, children: any[], text: string, x: number, y: number, width: number, size: number, header: boolean, language: string) {
  if (containsUnsupportedRtl(text)) throw Object.assign(new Error("Unsupported RTL script in report-card table cell."), { code: "RTL_PDF_UNSUPPORTED" });
  if (UNSUPPORTED_FONT_SCRIPT.test(text)) throw Object.assign(new Error("A licensed font pack is not bundled for one or more scripts in this report card."), { code: "PDF_FONT_SCRIPT_UNSUPPORTED" });
  const tag = header ? "TH" : "TD";
  const content = doc.markStructureContent(tag);
  const cellOptions = { x: x + 8, y: y + 5, width: width - 16, fontSize: size, lineGap: 1, align: "left", fillColor: header ? "#FFFFFF" : "#111827" };
  doc.fillColor(cellOptions.fillColor);
  if (containsRtl(text)) {
    doc.font("RTL").fontSize(size);
    const direction = detectDirection(text);
    textBidi(doc, `${text} `, cellOptions.x, cellOptions.y, { ...cellOptions, align: direction === "rtl" ? "right" : "left", bidi: { direction: "auto", paragraphs: "split" } });
  } else {
    const runs = splitFontRuns(text);
    runs.forEach((run, index) => {
      doc.font(run.font).fontSize(size);
      const runOptions = { ...cellOptions, continued: index < runs.length - 1 };
      if (index > 0) { delete runOptions.x; delete runOptions.y; }
      doc.text(run.text + (index === runs.length - 1 ? " " : ""), runOptions);
    });
  }
  doc.endMarkedContent();
  children.push(doc.struct(tag, { actual: text, lang: language }, [content]));
}

function addSubjectTable(doc: any, children: any[], subjects: ReportCardPdfInput["subjects"], options: { x: number; width: number; size: number; language: string; brand: string; compact: boolean }) {
  const leftWidth = Math.round(options.width * 0.58);
  const rightWidth = options.width - leftWidth;
  const rows: any[] = [];
  const headerY = doc.y;
  const headerHeight = options.compact ? 25 : 30;
  drawArtifact(doc, () => {
    doc.save().rect(options.x, headerY, options.width, headerHeight).fill(options.brand).restore();
  });
  const headerChildren: any[] = [];
  addTableCell(doc, headerChildren, "Subject", options.x, headerY, leftWidth, options.size, true, options.language);
  addTableCell(doc, headerChildren, "Assessment", options.x + leftWidth, headerY, rightWidth, options.size, true, options.language);
  rows.push(doc.struct("TR", {}, headerChildren));
  doc.y = headerY + headerHeight;

  for (const subject of subjects) {
    const assessment = [subject.marks, subject.grade ? `Grade: ${subject.grade}` : ""].filter(Boolean).join(" · ");
    const rowHeight = Math.max(
      measureText(doc, subject.name, leftWidth - 16, options.size),
      measureText(doc, assessment, rightWidth - 16, options.size)
    ) + (options.compact ? 10 : 14);
    if (doc.y + rowHeight > 735) doc.addPage();
    const y = doc.y;
    const cells: any[] = [];
    drawArtifact(doc, () => {
      if (rows.length % 2 === 0) doc.save().rect(options.x, y, options.width, rowHeight).fill("#F5F7FA").restore();
      doc.save().moveTo(options.x, y + rowHeight).lineTo(options.x + options.width, y + rowHeight).lineWidth(0.5).stroke("#D7DEE8").restore();
    });
    addTableCell(doc, cells, subject.name, options.x, y, leftWidth, options.size, false, options.language);
    addTableCell(doc, cells, assessment, options.x + leftWidth, y, rightWidth, options.size, false, options.language);
    rows.push(doc.struct("TR", {}, cells));
    doc.y = y + rowHeight;
  }
  children.push(doc.struct("Table", { title: "Subject assessment results" }, rows));
}

export async function buildReportCardPdf(input: ReportCardPdfInput): Promise<Buffer> {
  const language = input.language || "en-IN";
  const layout = input.layout || "STANDARD";
  const compact = layout === "COMPACT";
  const largePrint = layout === "LARGE_PRINT";
  const margin = largePrint ? 44 : 50;
  const width = 495;
  const brand = accessibleBrandColor(input.brandColor);
  const baseSize = largePrint ? 11 : compact ? 8 : 9;
  const titleSize = largePrint ? 20 : compact ? 16 : 18;
  const verticalGap = compact ? 6 : largePrint ? 13 : 9;
  const doc: any = new (PDFDocument as any)({
    size: "A4",
    margins: { top: margin, bottom: 52, left: margin, right: margin },
    bufferPages: true,
    tagged: true,
    subset: "PDF/UA",
    pdfVersion: "1.7",
    lang: language,
    displayTitle: true,
    info: {
      Title: `${input.studentName} — ${input.term || input.termName || "Student"} Report Card`,
      Author: input.schoolName,
      Subject: "Accessible student report card",
      Creator: "School Management SaaS",
      Producer: "School Management SaaS tagged PDF generator"
    }
  });

  doc.registerFont("Latin", fontPath("NotoSans-Regular.ttf"));
  doc.registerFont("Devanagari", fontPath("NotoSansDevanagari-Regular.ttf"));
  doc.registerFont("Bengali", fontPath("NotoSansBengali-Regular.ttf"));
  doc.registerFont("Gurmukhi", fontPath("NotoSansGurmukhi-Regular.ttf"));
  doc.registerFont("Gujarati", fontPath("NotoSansGujarati-Regular.ttf"));
  doc.registerFont("Tamil", fontPath("NotoSansTamil-Regular.ttf"));
  doc.registerFont("Telugu", fontPath("NotoSansTelugu-Regular.ttf"));
  doc.registerFont("Kannada", fontPath("NotoSansKannada-Regular.ttf"));
  doc.registerFont("Malayalam", fontPath("NotoSansMalayalam-Regular.ttf"));
  doc.registerFont("RTL", rtlFontPath);

  const chunks: Buffer[] = [];
  const children: any[] = [];
  const sectionChildren: any[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  try {
    if (input.schoolLogo) {
      try {
        addFigure(doc, sectionChildren, "School logo", [margin, margin, margin + 90, margin + 54], () => doc.image(input.schoolLogo!, margin, margin, { fit: [90, 54] }));
      } catch { /* A missing/invalid logo is omitted rather than breaking report generation. */ }
    }

    const verificationCode = input.verificationCode || "UNAVAILABLE";
    const verificationUrl = input.verificationUrl || verificationCode;
    const qr = await QRCode.toBuffer(verificationUrl, { type: "png", width: 120, margin: 1 });
    const qrX = 485, qrY = 42, qrSize = 72;
    drawArtifact(doc, () => doc.save().roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 5).fill("#FFFFFF").restore());
    addFigure(doc, sectionChildren, `QR code for verifying report card ${verificationCode}`, [qrX, qrY, qrX + qrSize, qrY + qrSize], () => doc.image(qr, qrX, qrY, { width: qrSize, height: qrSize }));

    const titleX = input.schoolLogo ? 150 : margin;
    addText(doc, sectionChildren, input.schoolName, { x: titleX, y: 50, width: 310, fontSize: titleSize, fillColor: brand, lineGap: 2 }, "H1", language);
    if (input.schoolAddress) addText(doc, sectionChildren, input.schoolAddress, { x: titleX, width: 310, fontSize: baseSize - 1, fillColor: "#374151" }, "P", language);
    doc.moveDown(verticalGap / 9);
    addText(doc, sectionChildren, "Student Report Card", { fontSize: largePrint ? 17 : 14, fillColor: "#111827", lineGap: 2 }, "H2", language);
    doc.moveDown(0.35);

    const metadata = [
      `Student: ${input.studentName}`,
      `Admission No.: ${input.admissionNumber}`,
      ...(input.className ? [`Class: ${input.className}`] : []),
      `Term: ${input.term || input.termName || ""}`,
      `Academic Year: ${input.academicYear}`,
      `Generated: ${(input.generatedAt || input.publishedAt || new Date()).toLocaleDateString("en-IN")}`
    ];
    for (const line of metadata) addText(doc, sectionChildren, line, { width, fontSize: baseSize, lineGap: 1, fillColor: "#111827" }, "P", language);

    doc.moveDown(verticalGap / 9);
    addSubjectTable(doc, sectionChildren, input.subjects, { x: margin, width, size: baseSize, language, brand, compact });
    doc.moveDown(verticalGap / 9);

    if (input.teacherRemarks || input.remarks) {
      addText(doc, sectionChildren, "Teacher Remarks", { fontSize: largePrint ? 15 : 12, fillColor: brand }, "H2", language);
      addText(doc, sectionChildren, input.teacherRemarks || input.remarks || "", { width, fontSize: baseSize, lineGap: 2, fillColor: "#111827" }, "P", language);
    }
    if (input.principalRemarks) {
      addText(doc, sectionChildren, "Principal Remarks", { fontSize: largePrint ? 15 : 12, fillColor: brand }, "H2", language);
      addText(doc, sectionChildren, input.principalRemarks, { width, fontSize: baseSize, lineGap: 2, fillColor: "#111827" }, "P", language);
    }

    if (input.signatureLabel) {
      doc.moveDown(verticalGap / 9);
      addText(doc, sectionChildren, input.signatureLabel, { x: 360, width: 185, fontSize: baseSize, align: "center", fillColor: "#111827" }, "P", language);
    }

    doc.moveDown(verticalGap / 9);
    addText(doc, sectionChildren, `Verification code: ${verificationCode}`, { fontSize: baseSize - 1, fillColor: "#374151" }, "P", language);
    if (input.footerText) addText(doc, sectionChildren, input.footerText, { fontSize: baseSize - 1, fillColor: "#374151", width }, "P", language);

    const section = doc.struct("Sect", { title: "Student report card" }, sectionChildren);
    doc.addStructure(doc.struct("Document", { lang: language, title: `${input.studentName} report card` }, [section]));

    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      drawArtifact(doc, () => {
        doc.font("Latin").fontSize(7).fillColor("#4B5563")
          .text(`Page ${i + 1} of ${pages.count}`, margin, 800, { width, align: "center" });
      }, "Pagination");
    }
    const completed = new Promise<void>((resolve, reject) => {
      doc.once("end", resolve);
      doc.once("error", reject);
    });
    doc.end();
    await completed;
    return Buffer.concat(chunks);
  } catch (error) {
    doc.end();
    throw error;
  }
}
