import { jsPDF } from "jspdf";

// Configuration variables for colors and fonts
const COLORS = {
  primary: "#1a5276", // Dark blue for headings
  secondary: "#2e86c1", // Lighter blue for subheadings
  accent: "#3498db", // Accent color for highlights
  text: "#333333", // Main text color
  lightText: "#7f8c8d", // Light text for secondary information
};

const FONTS = {
  main: "helvetica",
  sizes: {
    name: 24,
    title: 16,
    sectionHeader: 12,
    subHeader: 11,
    normal: 10,
    small: 9,
  },
  styles: {
    bold: "bold",
    normal: "normal",
    italic: "italic",
  },
};

// Define the CV interface to match your JSON structure
interface Contact {
  location: string;
  phone: string;
  email: string;
  linkedin: string;
}

interface Role {
  title: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
}

interface Experience {
  company: string;
  location: string;
  roles: Role[];
}

interface Education {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
}

interface Certification {
  name: string;
  institution: string;
  date: string;
}

interface CV {
  name: string;
  contact: Contact;
  title: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
}

/**
 * Draws a horizontal line with accent color
 * @param doc jsPDF document
 * @param y Y-position
 * @param thickness Line thickness
 */
const drawHorizontalLine = (
  doc: jsPDF,
  y: number,
  thickness: number = 0.5
): number => {
  const margin = 20;
  const width = doc.internal.pageSize.getWidth() - 2 * margin;

  doc.setDrawColor(COLORS.accent);
  doc.setLineWidth(thickness);
  doc.line(margin, y, margin + width, y);

  return y + 3; // Return the new Y position
};

/**
 * Generates a PDF CV from JSON data
 * @param cvData The CV data in JSON format
 * @returns The generated PDF document
 */
function generateCV(cvData: CV): jsPDF {
  // Initialize PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Current Y position tracker
  let yPos = margin;

  // Header - Name and Title
  doc.setTextColor(COLORS.primary);
  doc.setFont(FONTS.main, FONTS.styles.bold);
  doc.setFontSize(FONTS.sizes.name);
  doc.text(cvData.name, margin, yPos);
  yPos += 8;

  doc.setTextColor(COLORS.secondary);
  doc.setFontSize(FONTS.sizes.title);
  doc.text(cvData.title, margin, yPos);
  yPos += 10;

  // Contact information
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONTS.sizes.normal);
  doc.setFont(FONTS.main, FONTS.styles.normal);
  const contactInfo = [
    `Location: ${cvData.contact.location}`,
    `Phone: ${cvData.contact.phone}`,
    `Email: ${cvData.contact.email}`,
    `LinkedIn: ${cvData.contact.linkedin}`,
  ];

  doc.text(contactInfo, margin, yPos);
  yPos += contactInfo.length * 5 + 5;

  // Summary
  doc.setTextColor(COLORS.primary);
  doc.setFontSize(FONTS.sizes.sectionHeader);
  doc.setFont(FONTS.main, FONTS.styles.bold);
  doc.text("SUMMARY", margin, yPos);
  yPos += 2;
  yPos = drawHorizontalLine(doc, yPos, 0.5);
  yPos += 4;

  doc.setTextColor(COLORS.text);
  doc.setFont(FONTS.main, FONTS.styles.normal);
  doc.setFontSize(FONTS.sizes.normal);

  // Handle text wrapping for summary text
  const summaryLines = doc.splitTextToSize(cvData.summary, contentWidth);
  doc.text(summaryLines, margin, yPos);
  yPos += summaryLines.length * 5 + 8;

  // Skills
  doc.setTextColor(COLORS.primary);
  doc.setFontSize(FONTS.sizes.sectionHeader);
  doc.setFont(FONTS.main, FONTS.styles.bold);
  doc.text("SKILLS", margin, yPos);
  yPos += 2;
  yPos = drawHorizontalLine(doc, yPos, 0.5);
  yPos += 4;

  doc.setTextColor(COLORS.text);
  doc.setFont(FONTS.main, FONTS.styles.normal);
  doc.setFontSize(FONTS.sizes.normal);
  const skillsText = cvData.skills.join(" • ");
  const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
  doc.text(skillsLines, margin, yPos);
  yPos += skillsLines.length * 5 + 10;

  // Experience
  doc.setTextColor(COLORS.primary);
  doc.setFontSize(FONTS.sizes.sectionHeader);
  doc.setFont(FONTS.main, FONTS.styles.bold);
  doc.text("PROFESSIONAL EXPERIENCE", margin, yPos);
  yPos += 2;
  yPos = drawHorizontalLine(doc, yPos, 0.5);
  yPos += 6;

  // Loop through each experience entry
  for (const exp of cvData.experience) {
    // Check if need to add a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.setTextColor(COLORS.secondary);
    doc.setFontSize(FONTS.sizes.subHeader);
    doc.setFont(FONTS.main, FONTS.styles.bold);
    doc.text(exp.company, margin, yPos);

    doc.setTextColor(COLORS.lightText);
    doc.setFontSize(FONTS.sizes.normal);
    doc.setFont(FONTS.main, FONTS.styles.italic);
    doc.text(
      exp.location,
      pageWidth - margin - doc.getTextWidth(exp.location),
      yPos
    );
    yPos += 5;

    // Loop through each role in the experience
    for (const role of exp.roles) {
      doc.setTextColor(COLORS.text);
      doc.setFont(FONTS.main, FONTS.styles.bold);
      doc.text(role.title, margin, yPos);

      // Calculate date text width to position at the right
      const dateText = `${role.start_date} - ${role.end_date}`;
      doc.setFont(FONTS.main, FONTS.styles.italic);
      doc.setTextColor(COLORS.lightText);
      doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), yPos);
      yPos += 5;

      // Responsibilities
      doc.setTextColor(COLORS.text);
      doc.setFont(FONTS.main, FONTS.styles.normal);
      for (const resp of role.responsibilities) {
        const respLines = doc.splitTextToSize(`• ${resp}`, contentWidth - 5);
        doc.text(respLines, margin + 5, yPos);
        yPos += respLines.length * 5;
      }

      yPos += 3; // Space between roles
    }

    yPos += 7; // Space between experiences
  }

  // Education
  // Check if need to add a new page
  if (yPos > 230) {
    doc.addPage();
    yPos = margin;
  }

  doc.setTextColor(COLORS.primary);
  doc.setFontSize(FONTS.sizes.sectionHeader);
  doc.setFont(FONTS.main, FONTS.styles.bold);
  doc.text("EDUCATION", margin, yPos);
  yPos += 2;
  yPos = drawHorizontalLine(doc, yPos, 0.5);
  yPos += 6;

  for (const edu of cvData.education) {
    doc.setTextColor(COLORS.secondary);
    doc.setFontSize(FONTS.sizes.subHeader);
    doc.setFont(FONTS.main, FONTS.styles.bold);
    doc.text(edu.degree, margin, yPos);
    yPos += 5;

    doc.setTextColor(COLORS.text);
    doc.setFontSize(FONTS.sizes.normal);
    doc.setFont(FONTS.main, FONTS.styles.normal);
    doc.text(edu.institution, margin, yPos);

    const dateText = `${edu.start_date} - ${edu.end_date}`;
    doc.setFont(FONTS.main, FONTS.styles.italic);
    doc.setTextColor(COLORS.lightText);
    doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), yPos);
    yPos += 8;
  }

  // Certifications
  if (cvData.certifications && cvData.certifications.length > 0) {
    // Check if need to add a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.setTextColor(COLORS.primary);
    doc.setFontSize(FONTS.sizes.sectionHeader);
    doc.setFont(FONTS.main, FONTS.styles.bold);
    doc.text("CERTIFICATIONS", margin, yPos);
    yPos += 2;
    yPos = drawHorizontalLine(doc, yPos, 0.5);
    yPos += 6;

    for (const cert of cvData.certifications) {
      doc.setTextColor(COLORS.secondary);
      doc.setFontSize(FONTS.sizes.subHeader);
      doc.setFont(FONTS.main, FONTS.styles.bold);
      doc.text(cert.name, margin, yPos);
      yPos += 5;

      doc.setTextColor(COLORS.text);
      doc.setFontSize(FONTS.sizes.normal);
      doc.setFont(FONTS.main, FONTS.styles.normal);
      doc.text(cert.institution, margin, yPos);

      doc.setFont(FONTS.main, FONTS.styles.italic);
      doc.setTextColor(COLORS.lightText);
      doc.text(
        cert.date,
        pageWidth - margin - doc.getTextWidth(cert.date),
        yPos
      );
      yPos += 8;
    }
  }

  return doc;
}

/**
 * Main function to generate and save CV as PDF
 */
export function createCVPdf(cvData: CV, customColors?: typeof COLORS): void {
  // Allow custom colors if provided
  if (customColors) {
    Object.assign(COLORS, customColors);
  }

  const doc = generateCV(cvData);
  doc.save(`${cvData.name.replace(/\s+/g, "_")}_CV.pdf`);
}

// Example usage:
// import { myBaseCV } from './cv-data';
// createCVPdf(myBaseCV);

// Or with custom colors:
// createCVPdf(myBaseCV, {
//   primary: '#2c3e50',
//   secondary: '#34495e',
//   accent: '#3498db',
//   text: '#2c3e50',
//   lightText: '#7f8c8d'
// });
