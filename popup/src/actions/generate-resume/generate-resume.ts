import jsPDF from "jspdf";
import { CV } from "./types";
import { COLORS, FONTS, PAGE_MARGIN, SPACING, BULLET_INDENT } from "./const";
import { generateCvPdfWithPdfMake } from "./generate-resume-new";

// Build the CV document
const docDefinition = {
  content: [
    { text: "John Doe", style: "header" },
    { text: "Frontend Developer", style: "subheader" },
    { text: "\n" },

    { text: "Contact Information", style: "sectionHeader" },
    {
      ul: [
        "Email: john.doe@example.com",
        "Phone: +1234567890",
        "LinkedIn: linkedin.com/in/johndoe",
      ],
    },
    { text: "\n" },

    { text: "Experience", style: "sectionHeader" },
    {
      ul: [
        "Company A - Frontend Developer (2020 - Present)",
        "Company B - Junior Developer (2018 - 2020)",
      ],
    },
    { text: "\n" },

    { text: "Education", style: "sectionHeader" },
    {
      ul: ["BSc in Computer Science, University X (2014 - 2018)"],
    },
  ],

  styles: {
    header: { fontSize: 22, bold: true },
    subheader: { fontSize: 16, italics: true },
    sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
  },
};

const CONTENT_WIDTH = 210 - PAGE_MARGIN * 2; // A4 width (210) minus margins on both sides
const LINE_HEIGHT = 3.8; // Line height for wrapped text (proportional to 10pt font)

// Simplified text styling helper
function text(
  doc: jsPDF,
  content: string,
  options: {
    size?: number;
    bold?: boolean;
    color?: string;
    x?: number;
    y: number;
  }
) {
  const {
    size = FONTS.sizes.normal,
    bold = false,
    color = COLORS.text,
    x = PAGE_MARGIN,
    y,
  } = options;
  doc.setFont(FONTS.main, bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(color);
  doc.text(content, x, y);
}

// Check if we need a new page
function newPageIfNeeded(doc: jsPDF, y: number, space: number): number {
  if (y + space > doc.internal.pageSize.getHeight() - PAGE_MARGIN) {
    doc.addPage();
    return PAGE_MARGIN;
  }
  return y;
}

// Wrapped text
function wrappedText(
  doc: jsPDF,
  content: string,
  y: number,
  options?: { size?: number; bold?: boolean; color?: string; width?: number }
): number {
  const {
    size = FONTS.sizes.normal,
    bold = false,
    color = COLORS.text,
    width = CONTENT_WIDTH,
  } = options || {};

  // Use text helper to apply consistent styling
  doc.setFont(FONTS.main, bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(color);

  const lines = doc.splitTextToSize(content, width);
  doc.text(lines, PAGE_MARGIN, y);
  return y + lines.length * LINE_HEIGHT;
}

// Section title with line
function sectionTitle(doc: jsPDF, title: string, y: number): number {
  text(doc, title, {
    size: FONTS.sizes.sectionHeader,
    bold: true,
    color: COLORS.primary,
    y,
  });
  doc.setDrawColor(COLORS.line);
  doc.setLineWidth(0.2);
  doc.line(PAGE_MARGIN, y + 2, PAGE_MARGIN + CONTENT_WIDTH, y + 2);
  return y + SPACING.normal;
}

// Bullet list
function bulletList(doc: jsPDF, items: string[], y: number): number {
  doc.setFont(FONTS.main, "normal");
  doc.setFontSize(FONTS.sizes.normal);
  doc.setTextColor(COLORS.text);

  for (const item of items) {
    const lines = doc.splitTextToSize(
      `• ${item}`,
      CONTENT_WIDTH - BULLET_INDENT * 2
    );
    doc.text(lines, PAGE_MARGIN + BULLET_INDENT, y);
    y += lines.length * LINE_HEIGHT * 1.4;
  }
  return y;
}

export function generateResume(cvData: CV): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = PAGE_MARGIN;

  // Header
  text(doc, cvData.name, {
    size: FONTS.sizes.name,
    bold: true,
    color: COLORS.primary,
    y,
  });
  y += SPACING.normal;
  text(doc, cvData.title, {
    size: FONTS.sizes.title,
    color: COLORS.secondary,
    y,
  });
  y += SPACING.normal;
  text(
    doc,
    `${cvData.contact.location} | ${cvData.contact.phone} | ${cvData.contact.email} | ${cvData.contact.linkedin}`,
    { size: FONTS.sizes.small, y }
  );

  y += SPACING.section;

  // Summary
  y = sectionTitle(doc, "Summary", y);
  y = wrappedText(doc, cvData.summary, y);

  y += SPACING.section;

  // Skills
  y = sectionTitle(doc, "Skills", y);
  y = wrappedText(doc, cvData.skills.join(" • "), y) + SPACING.section;

  // Experience
  y = sectionTitle(doc, "Professional Experience", y);
  for (const exp of cvData.experience) {
    y = newPageIfNeeded(doc, y, 30);
    text(doc, exp.company, {
      size: FONTS.sizes.subHeader,
      bold: true,
      color: COLORS.primary,
      y,
    });
    text(doc, `${exp.location}`, {
      size: FONTS.sizes.small,
      color: COLORS.lightText,
      x: PAGE_MARGIN + CONTENT_WIDTH - doc.getTextWidth(exp.location),
      y,
    });
    y += SPACING.normal;

    for (const role of exp.roles) {
      y = newPageIfNeeded(doc, y, 20);
      text(doc, role.title, {
        size: FONTS.sizes.normal,
        bold: true,
        color: COLORS.secondary,
        y,
      });
      text(doc, `${role.start_date} - ${role.end_date}`, {
        size: FONTS.sizes.small,
        color: COLORS.lightText,
        x:
          PAGE_MARGIN +
          CONTENT_WIDTH -
          doc.getTextWidth(`${role.start_date} - ${role.end_date}`),
        y,
      });
      y += SPACING.normal;
      y = bulletList(doc, role.responsibilities, y) + SPACING.tight;
    }
    y += SPACING.tight;
  }
  y += SPACING.section;

  // Education
  y = sectionTitle(doc, "Education", y);
  for (const edu of cvData.education) {
    y = newPageIfNeeded(doc, y, 20);
    text(doc, edu.degree, {
      size: FONTS.sizes.subHeader,
      bold: true,
      color: COLORS.primary,
      y,
    });
    y += SPACING.tight;
    text(doc, edu.institution, { size: FONTS.sizes.normal, y });
    text(doc, `${edu.start_date} - ${edu.end_date}`, {
      size: FONTS.sizes.small,
      color: COLORS.lightText,
      x:
        PAGE_MARGIN +
        CONTENT_WIDTH -
        doc.getTextWidth(`${edu.start_date} - ${edu.end_date}`),
      y,
    });
    y += SPACING.section;
  }

  // Certifications
  if (cvData.certifications.length) {
    y = sectionTitle(doc, "Certifications", y);
    for (const cert of cvData.certifications) {
      y = newPageIfNeeded(doc, y, 20);
      text(doc, cert.name, {
        size: FONTS.sizes.subHeader,
        bold: true,
        color: COLORS.primary,
        y,
      });
      y += SPACING.tight;
      text(doc, cert.institution, { size: FONTS.sizes.normal, y });
      text(doc, cert.date, {
        size: FONTS.sizes.small,
        color: COLORS.lightText,
        x: PAGE_MARGIN + CONTENT_WIDTH - doc.getTextWidth(cert.date),
        y,
      });
      y += SPACING.section;
    }
  }

  return doc;
}

export function generateResumePdf(
  cvData: CV,
  customColors?: typeof COLORS
): void {
  generateCvPdfWithPdfMake(cvData);
  // if (customColors) Object.assign(COLORS, customColors);
  // generateResume(cvData).save(`${cvData.name.replace(/\s+/g, "_")}_CV.pdf`);
}
