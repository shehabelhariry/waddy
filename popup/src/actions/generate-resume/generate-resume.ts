import jsPDF from "jspdf";
import { CV } from "./types";
import {
  renderCertifications,
  renderEducation,
  renderExperience,
  renderHeader,
  renderSkills,
  renderSummary,
} from "./helpers";
import { COLORS } from "./const";

export function generateResume(cvData: CV): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPos = renderHeader(doc, cvData);

  yPos = renderSummary(doc, cvData.summary, yPos);
  yPos = renderSkills(doc, cvData.skills, yPos);
  yPos = renderExperience(doc, cvData.experience, yPos);
  yPos = renderEducation(doc, cvData.education, yPos);
  yPos = renderCertifications(doc, cvData.certifications, yPos);

  return doc;
}

export function generateResumePdf(
  cvData: CV,
  customColors?: typeof COLORS
): void {
  // Allow custom colors if provided
  if (customColors) {
    Object.assign(COLORS, customColors);
  }

  const doc = generateResume(cvData);
  doc.save(`${cvData.name.replace(/\s+/g, "_")}_CV.pdf`);
}
