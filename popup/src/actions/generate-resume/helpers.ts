import jsPDF from "jspdf";
import {
  COLORS,
  FONTS,
  PAGE_MARGIN,
  SPACING,
  SPACING_BETWEEN_SECTIONS,
} from "./const";
import { CvType } from "../../baseCV";
import { Certification, Education, Experience } from "./types";

function addSpacing(yPos: number, amount: number): number {
  return yPos + amount;
}

function endSection(yPos: number): number {
  return addSpacing(yPos, SPACING.sectionGap);
}

function betweenItems(yPos: number): number {
  return addSpacing(yPos, SPACING.itemGap);
}

export function setTextStyle(
  doc: jsPDF,
  {
    size,
    style = "normal",
    color = COLORS.text,
  }: {
    size: number;
    style?: keyof typeof FONTS.styles;
    color?: string;
  }
) {
  doc.setFont(FONTS.main, FONTS.styles[style]);
  doc.setFontSize(size);
  doc.setTextColor(color);
}

export function ensurePageSpace(
  doc: jsPDF,
  yPos: number,
  requiredSpace: number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (yPos + requiredSpace > pageHeight - PAGE_MARGIN) {
    doc.addPage();
    return PAGE_MARGIN;
  }
  return yPos;
}

export function drawRightAlignedText(doc: jsPDF, text: string, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(text, pageWidth - PAGE_MARGIN - doc.getTextWidth(text), y);
}

export function drawHorizontalLine(
  doc: jsPDF,
  y: number,
  thickness = 0.2
): number {
  const width = doc.internal.pageSize.getWidth() - 2 * PAGE_MARGIN;

  doc.setDrawColor(COLORS.line);
  doc.setLineWidth(thickness);
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + width, y);

  return y + 6;
}

export function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

// Content Helpers
export function drawSectionHeader(
  doc: jsPDF,
  title: string,
  yPos: number
): number {
  setTextStyle(doc, {
    size: FONTS.sizes.sectionHeader,
    style: "bold",
    color: COLORS.primary,
  });

  doc.text(title, PAGE_MARGIN, yPos);
  yPos += 4;
  return drawHorizontalLine(doc, yPos);
}

export function drawBulletList(
  doc: jsPDF,
  items: string[],
  yPos: number,
  contentWidth: number
): number {
  setTextStyle(doc, {
    size: FONTS.sizes.normal,
    color: COLORS.text,
  });

  for (const item of items) {
    const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 6);
    doc.text(lines, PAGE_MARGIN + 3, yPos);
    yPos += lines.length * 6.5;
  }

  return yPos;
}

export function renderHeader(doc: jsPDF, cv: CvType): number {
  const contentWidth = doc.internal.pageSize.getWidth() - 2 * PAGE_MARGIN;
  let yPos = PAGE_MARGIN;

  setTextStyle(doc, {
    size: FONTS.sizes.name,
    style: "bold",
    color: COLORS.primary,
  });
  doc.text(cv.name, PAGE_MARGIN, yPos);
  yPos += 7;

  setTextStyle(doc, {
    size: FONTS.sizes.title,
    color: COLORS.secondary,
  });
  doc.text(cv.title, PAGE_MARGIN, yPos);
  yPos += 8;

  setTextStyle(doc, {
    size: FONTS.sizes.small,
  });

  const contact = `${cv.contact.location} | ${cv.contact.phone} | ${cv.contact.email} | ${cv.contact.linkedin}`;

  yPos =
    drawWrappedText(doc, contact, PAGE_MARGIN, yPos, contentWidth, 4) +
    SPACING_BETWEEN_SECTIONS;

  return yPos;
}

interface RenderSectionArgs {
  doc: jsPDF;
  yPos: number;
  title: string;
  renderContent: (doc: jsPDF, yPos: number) => number;
  minHeight?: number;
}

export function renderSection({
  doc,
  yPos,
  title,
  minHeight = 20,
  renderContent,
}: RenderSectionArgs): number {
  // Header
  yPos = drawSectionHeader(doc, title, yPos);

  // Make sure at least some content fits
  yPos = ensurePageSpace(doc, yPos, minHeight);

  // Section body
  yPos = renderContent(doc, yPos);

  // Consistent spacing after every section
  return endSection(yPos);
}

// Section Helpers
export function renderSummary(
  doc: jsPDF,
  summary: string,
  yPos: number
): number {
  return renderSection({
    doc,
    yPos,
    title: "Summary",
    minHeight: 25, // enough for a few lines of text
    renderContent: (doc, y) => {
      const contentWidth = doc.internal.pageSize.getWidth() - 2 * PAGE_MARGIN;

      setTextStyle(doc, {
        size: FONTS.sizes.normal,
        color: COLORS.text,
      });

      return drawWrappedText(doc, summary, PAGE_MARGIN, y, contentWidth, 5);
    },
  });
}

export function renderSkills(
  doc: jsPDF,
  skills: string[],
  yPos: number
): number {
  return renderSection({
    doc,
    yPos,
    title: "Skills",
    renderContent: (doc, y) => {
      const contentWidth = doc.internal.pageSize.getWidth() - 2 * PAGE_MARGIN;

      const text = skills.join("  •  ");

      setTextStyle(doc, {
        size: FONTS.sizes.normal,
      });

      return drawWrappedText(doc, text, PAGE_MARGIN, y, contentWidth, 5);
    },
  });
}

export function renderExperience(
  doc: jsPDF,
  experience: Experience[],
  yPos: number
): number {
  const contentWidth = doc.internal.pageSize.getWidth() - 2 * PAGE_MARGIN;

  return renderSection({
    doc,
    yPos,
    title: "Professional Experience",
    renderContent: (doc, y) => {
      for (const exp of experience) {
        y = ensurePageSpace(doc, y, 30);

        // ── Company header ─────────────────────────
        setTextStyle(doc, {
          size: FONTS.sizes.subHeader,
          style: "bold",
          color: COLORS.primary,
        });
        doc.text(exp.company, PAGE_MARGIN, y);

        setTextStyle(doc, {
          size: FONTS.sizes.small,
          color: COLORS.lightText,
        });
        drawRightAlignedText(doc, exp.location, y);

        y += 6;

        // ── Roles ──────────────────────────────────
        for (const role of exp.roles) {
          y = ensurePageSpace(doc, y, 20);

          setTextStyle(doc, {
            size: FONTS.sizes.normal,
            style: "bold",
            color: COLORS.secondary,
          });
          doc.text(role.title, PAGE_MARGIN, y);

          setTextStyle(doc, {
            size: FONTS.sizes.small,
            color: COLORS.lightText,
          });

          drawRightAlignedText(doc, `${role.start_date} - ${role.end_date}`, y);

          y += 5;

          y = drawBulletList(doc, role.responsibilities, y, contentWidth);

          y += 6; // space between roles
        }

        y += 4; // space between companies
      }

      return y;
    },
  });
}

export function renderEducation(
  doc: jsPDF,
  education: Education[],
  yPos: number
): number {
  yPos = drawSectionHeader(doc, "Education", yPos);

  for (const edu of education) {
    yPos = ensurePageSpace(doc, yPos, 20);

    setTextStyle(doc, {
      size: FONTS.sizes.subHeader,
      style: "bold",
      color: COLORS.primary,
    });

    doc.text(edu.degree, PAGE_MARGIN, yPos);
    yPos += 5;

    setTextStyle(doc, {
      size: FONTS.sizes.normal,
    });

    doc.text(edu.institution, PAGE_MARGIN, yPos);

    setTextStyle(doc, {
      size: FONTS.sizes.small,
      color: COLORS.lightText,
    });

    drawRightAlignedText(doc, `${edu.start_date} - ${edu.end_date}`, yPos);

    yPos = endSection(yPos);
  }

  return yPos;
}

export function renderCertifications(
  doc: jsPDF,
  certifications: Certification[],
  yPos: number
): number {
  if (!certifications.length) return yPos;

  yPos = drawSectionHeader(doc, "Certifications", yPos);

  for (const cert of certifications) {
    yPos = ensurePageSpace(doc, yPos, 20);

    setTextStyle(doc, {
      size: FONTS.sizes.subHeader,
      style: "bold",
      color: COLORS.primary,
    });
    doc.text(cert.name, PAGE_MARGIN, yPos);
    yPos += 5;

    setTextStyle(doc, {
      size: FONTS.sizes.normal,
    });
    doc.text(cert.institution, PAGE_MARGIN, yPos);

    setTextStyle(doc, {
      size: FONTS.sizes.small,
      color: COLORS.lightText,
    });
    drawRightAlignedText(doc, cert.date, yPos);
    yPos = endSection(yPos);
  }

  return yPos;
}
