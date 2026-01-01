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
      ...cv.experience.map((exp) => ({
        stack: [
          // Company
          {
            text: exp.company + (exp.location ? ` - ${exp.location}` : ""),
            style: "companyTitle",
            margin: [0, 10, 0, 4],
          },

          // Roles inside company
          ...exp.roles.map((role) => ({
            stack: [
              {
                text: `${role.title} (${role.start_date} - ${role.end_date})`,
                style: "roleTitle",
                margin: [10, 4, 0, 2],
              },
              {
                ul: role.responsibilities,
                style: "text",
                margin: [20, 0, 0, 4],
              },
            ],
          })),
        ],
      })),

      // Education
      { text: "Education", style: "sectionHeader" },
      ...cv.education.map((edu) => ({
        stack: [
          {
            text: edu.institution,
            style: "companyTitle", // reuse or create education-specific style
            margin: [0, 8, 0, 2],
          },
          {
            text: `${edu.degree} (${edu.start_date} - ${edu.end_date})`,
            style: "roleTitle",
            margin: [10, 0, 0, 6],
          },
        ],
      })),

      // Certifications
      { text: "Certifications", style: "sectionHeader" },
      ...cv.certifications.map((cert) => ({
        stack: [
          {
            text: cert.institution,
            style: "companyTitle",
            margin: [0, 8, 0, 2],
          },
          {
            text: `${cert.name} (${cert.date})`,
            style: "roleTitle",
            margin: [10, 0, 0, 6],
          },
        ],
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
      companyTitle: {
        fontSize: 12,
        bold: true,
        margin: [0, 10, 0, 4],
        italics: true,
      },
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
