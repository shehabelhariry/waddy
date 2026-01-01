// Based on: https://pdfmake.github.io/docs/0.3/document-definition-object/styling/

import { CvType } from "../../baseCV";
//@ts-ignore
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { COLORS } from "./const";

// Example function to generate CV PDF
export const generateResumePdf = (cv: CvType) => {
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
            style: index < 3 ? "skillHighlight" : "text",
          },
          { text: index < cv.skills.length - 1 ? " • " : "" },
        ]),
        margin: [0, 0, 0, 6],
      },

      // Experience
      { text: "Experience", style: "sectionHeader" },
      ...cv.experience.map((exp) => ({
        stack: [
          {
            text: exp.company + (exp.location ? ` - ${exp.location}` : ""),
            style: "companyTitle",
          },
          ...exp.roles.map((role) => ({
            stack: [
              {
                text: `${role.title} (${role.start_date} - ${role.end_date})`,
                style: "roleTitle",
              },
              {
                ul: role.responsibilities,
                style: "text",
                margin: [12, 1, 0, 4],
              },
            ],
          })),
        ],
        margin: [0, 0, 0, 6],
      })),

      // Education
      { text: "Education", style: "sectionHeader" },
      ...cv.education.map((edu) => ({
        stack: [
          {
            text: edu.institution,
            style: "companyTitle",
          },
          {
            text: `${edu.degree} (${edu.start_date} - ${edu.end_date})`,
            style: "roleTitle",
          },
        ],
        margin: [0, 0, 0, 6],
      })),

      // Certifications
      { text: "Certifications", style: "sectionHeader" },
      ...cv.certifications.map((cert) => ({
        stack: [
          {
            text: cert.institution,
            style: "companyTitle",
          },
          {
            text: `${cert.name} (${cert.date})`,
            style: "roleTitle",
          },
        ],
        margin: [0, 0, 0, 6],
      })),
    ],

    styles: {
      name: {
        fontSize: 22,
        bold: true,
        color: COLORS.primary,
        margin: [0, 0, 0, 1],
      },
      title: {
        fontSize: 16,
        italics: true,
        margin: [0, 0, 0, 4],
        color: COLORS.primary,
      },
      contact: {
        fontSize: 10,
        margin: [0, 0, 0, 10],
      },
      sectionHeader: {
        fontSize: 14,
        color: COLORS.primary,
        bold: true,
        margin: [0, 8, 0, 4],
      },
      roleTitle: {
        fontSize: 11,
        bold: true,
        margin: [0, 3, 0, 1],
        lineHeight: 1.15,
      },
      companyTitle: {
        fontSize: 11,
        italics: true,
        margin: [0, 0, 0, 1],
        lineHeight: 1.15,
      },
      text: {
        fontSize: 11,
        margin: [0, 0, 0, 1],
        lineHeight: 1.25,
      },
      skillHighlight: {
        fontSize: 11,
        margin: [0, 0, 0, 1],
        bold: true,
        lineHeight: 1.25,
      },
    },
  };

  // Generate the PDF
  pdfMake
    .createPdf(docDefinition)
    .download(`${cv.name.replace(/\s/g, "_")}_CV.pdf`);
};
