// Based on: https://pdfmake.github.io/docs/0.3/document-definition-object/styling/

import { CvType } from "../../baseCV";
//@ts-ignore
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { COLORS } from "./const";

// Example function to generate CV PDF
export const generateCvPdfWithPdfMake = (cv: CvType) => {
  const docDefinition = {
    content: [
      // Header
      { text: cv.name, style: "name" },
      { text: cv.title, style: "title" },
      {
        text: [
          `${cv.contact.location} | ${cv.contact.phone} | ${cv.contact.email} | ${cv.contact.linkedin}`,
        ],
        style: "contact",
      },

      // Summary
      { text: "Summary", style: "sectionHeader" },
      { text: cv.summary, style: "text" },

      // Skills
      { text: "Skills", style: "sectionHeader" },
      {
        text: cv.skills.flatMap((skill, index) => [
          {
            text: skill,
            style: index < 3 ? "text_underline" : "text",
          },
          { text: index < cv.skills.length - 1 ? " • " : "" },
        ]),
      },

      // Experience
      { text: "Experience", style: "sectionHeader" },
      ...cv.experience.flatMap((exp) =>
        exp.roles
          .map((role) => [
            {
              text: `${role.title} @ ${exp.company} (${role.start_date} - ${role.end_date})`,
              style: "roleTitle",
            },
            { ul: role.responsibilities, style: "text" },
          ])
          .flat()
      ),

      // Education
      { text: "Education", style: "sectionHeader" },
      ...cv.education.map((edu) => ({
        text: `${edu.degree}, ${edu.institution} (${edu.start_date} - ${edu.end_date})`,
        style: "text",
      })),

      // Certifications
      { text: "Certifications", style: "sectionHeader" },
      ...cv.certifications.map((cert) => ({
        text: `${cert.name}, ${cert.institution} (${cert.date})`,
        style: "text",
      })),
    ],

    styles: {
      name: { fontSize: 22, bold: true, color: COLORS.primary },
      title: {
        fontSize: 16,
        italics: true,
        margin: [0, 0, 0, 5],
        color: COLORS.primary,
      },
      contact: { fontSize: 10, margin: [0, 0, 0, 10] },
      sectionHeader: {
        fontSize: 14,
        color: COLORS.primary,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      roleTitle: { fontSize: 12, bold: true, margin: [0, 5, 0, 2] },
      text: { fontSize: 11, margin: [0, 0, 0, 2] },
      text_underline: {
        fontSize: 11,
        margin: [50, 20, 10, 2],
        bold: true,
        decoration: "underline",
      },
    },
  };

  // Generate the PDF
  pdfMake
    .createPdf(docDefinition)
    .download(`${cv.name.replace(/\s/g, "_")}_CV.pdf`);
};
