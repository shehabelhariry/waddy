import { jsPDF } from "jspdf";
import { JobData } from "./types";
import {
  callLLM,
  downloadText,
  extractTextBetweenTags,
  loadPrompt,
} from "./utils";
import { cvSample } from "./baseCV";
import { getCvFromStorage } from "./storage";

export const getCvJsonFromExtractedText = async (extractedText: string) => {
  const prompt = await loadPrompt("createCvObject.txt", {
    cv_text: extractedText,
    sample_json: JSON.stringify(cvSample, null, 2),
  });

  const response = await callLLM({
    system: `You are an expert in extracting structured data from CVs`,
    prompt,
  });

  if (!response) return null;

  const cvString = extractTextBetweenTags(response, "new_cv")!;
  return JSON.parse(cvString);
};

export const handleCoverLetter = async (
  jobData: JobData,
  setLoading: Function,
  setMatchScore: Function
) => {
  if (!jobData) return;

  const prompt = await loadPrompt("coverLetter.txt", {
    company: jobData.company,
    location: jobData.location,
    description: jobData.description,
  });

  setLoading(true);

  const response = await callLLM({
    system: `You are a personal consultant helping to draft a cover letter for ${jobData.company}`,
    prompt,
  });

  let letter = extractTextBetweenTags(response, "letter") || "";
  let score = extractTextBetweenTags(response, "grade") || null;

  setMatchScore(score);

  handleSaveJob({ jobData, score: score, coverLetter: letter });

  setLoading(false);

  downloadText(letter, `${jobData.company}.txt`);
};

type HandleSaveJobArgs = {
  jobData: JobData;
  score: string | null;
  coverLetter: string | null;
};
export const handleSaveJob = async ({
  jobData,
  score,
  coverLetter,
}: HandleSaveJobArgs) => {
  if (!jobData) return alert("No job data available");

  const response = await fetch(import.meta.env.VITE_SHEET_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobTitle: jobData.title,
      company: jobData.company,
      location: jobData.location,
      description: jobData.description,
      dateAdded: new Date().toISOString().split("T")[0], // Save date
      url: jobData.jobUrl,
      score: score,
      coverLetter,
    }),
  });

  const result = await response.json();
  if (result.status === "success") {
    alert("✅ Job saved to Google Sheets!");
  } else {
    alert("❌ Failed to save job.");
  }
};

// Configurable PDF styling
const CONFIG = {
  page: {
    width: 595, // A4 width in pt
    marginX: 40, // Left/right margins
    startY: 50, // Initial Y position
  },
  fonts: {
    main: "times",
    size: {
      name: 22,
      title: 16,
      section: 14,
      text: 12,
      bullet: 12,
    },
  },
  spacing: {
    sectionTitle: 20,
    textBlock: 14,
    bulletPoint: 12,
    lineGap: 8,
    jobGap: 20, // Extra spacing between jobs
  },
  colors: {
    primary: [0, 0, 139] as [number, number, number], // Navy blue
    secondary: [50, 50, 50] as [number, number, number], // Dark gray
    accent: [80, 80, 80] as [number, number, number], // Light gray
  },
};

// Function to generate the resume PDF
export async function generateResumePDF(
  jobData: JobData,
  setIsLoading: Function
) {
  setIsLoading(true);

  const cv = await getCvFromStorage();

  const prompt = await loadPrompt("customizedResume.txt", {
    cv: JSON.stringify(cv, null, 2),
    job: jobData.description,
  });

  const resp = await callLLM({
    system: "you are a consultant specialized in creating CVs",
    prompt: prompt,
  });

  let resume = JSON.parse(extractTextBetweenTags(resp, "new_cv") || "{}");

  //@ts-ignore
  const doc = new jsPDF({ unit: "pt", format: "A4", lineHeight: 1.5 });

  // Set default font
  doc.setFont(CONFIG.fonts.main, "normal");

  let y = CONFIG.page.startY;

  // Header - Name & Title
  doc
    .setFontSize(CONFIG.fonts.size.name)
    .setFont(CONFIG.fonts.main, "bold")
    .setTextColor(...CONFIG.colors.primary);
  doc.text(resume.name, CONFIG.page.marginX, y);
  y += CONFIG.spacing.sectionTitle;

  doc
    .setFontSize(CONFIG.fonts.size.title)
    .setFont(CONFIG.fonts.main, "bold")
    .setTextColor(...CONFIG.colors.secondary);
  doc.text(resume.title, CONFIG.page.marginX, y);
  y += CONFIG.spacing.sectionTitle;

  // Contact Info (Standard format)
  function addContactInfo(): void {
    const contactDetails = [
      { label: "Email:", value: resume.contact.email },
      { label: "LinkedIn:", value: resume.contact.linkedin },
    ];

    doc
      .setFontSize(CONFIG.fonts.size.text)
      .setFont(CONFIG.fonts.main, "normal")
      .setTextColor(0, 0, 0);

    let x = CONFIG.page.marginX; // Start from left margin
    const yPos = y; // Keep y constant
    const labelValueSpacing = 5; // Space between label and value
    const detailSpacing = 40; // Space between contact details

    contactDetails.forEach((detail) => {
      // Draw the label (bold)
      doc.setFont(CONFIG.fonts.main, "bold");
      doc.text(detail.label, x, yPos);

      // Calculate the position for the value
      const labelWidth = doc.getTextWidth(detail.label);
      const valueX = x + labelWidth + labelValueSpacing;

      // Draw the value (normal)
      doc.setFont(CONFIG.fonts.main, "normal");
      doc.text(detail.value, valueX, yPos);

      // Move x to the right for the next detail
      x = valueX + doc.getTextWidth(detail.value) + detailSpacing;
    });

    y += CONFIG.spacing.sectionTitle; // Move down for the next section
  }

  // Call the function inside `generateResumePDF()`
  addContactInfo();

  // Section Helper Function
  function addSection(title: string): void {
    doc
      .setFontSize(CONFIG.fonts.size.section)
      .setFont(CONFIG.fonts.main, "bold")
      .setTextColor(...CONFIG.colors.primary);
    doc.text(title, CONFIG.page.marginX, y);
    doc.setDrawColor(...CONFIG.colors.primary);
    doc.line(
      CONFIG.page.marginX,
      y + 3,
      CONFIG.page.width - CONFIG.page.marginX,
      y + 3
    ); // Underline
    y += CONFIG.spacing.sectionTitle;
    doc
      .setFont(CONFIG.fonts.main, "normal")
      .setFontSize(CONFIG.fonts.size.text)
      .setTextColor(0, 0, 0);
  }

  // Text Block Helper Function
  function addTextBlock(
    text: string,
    maxWidth: number,
    lineHeight: number = CONFIG.spacing.textBlock
  ): void {
    const textLines = doc.splitTextToSize(text, maxWidth);
    textLines.forEach((line: any) => {
      doc.text(line, CONFIG.page.marginX, y);
      y += lineHeight;
    });
    y += CONFIG.spacing.lineGap; // Small space after each block
  }

  // Bullet Point Helper Function
  function addBulletPoints(items: string[], maxWidth: number): void {
    items.forEach((item) => {
      // Split the item into multiple lines if it exceeds maxWidth
      const lines = doc.splitTextToSize(item, maxWidth - 20); // Adjust for bullet and padding

      // Draw the bullet symbol for the first line
      doc.text("•", CONFIG.page.marginX, y);

      // Draw each line of the bullet point
      lines.forEach((line: any, lineIndex: number) => {
        if (lineIndex > 0) {
          // If it's not the first line, align text with the bullet
          doc.text(line, CONFIG.page.marginX + 15, y);
        } else {
          // For the first line, add padding after the bullet
          doc.text(line, CONFIG.page.marginX + 15, y);
        }
        y += CONFIG.spacing.bulletPoint; // Move y down for the next line
      });

      y += CONFIG.spacing.lineGap; // Space after each bullet point
    });
  }

  // Summary
  addSection("Summary");
  addTextBlock(resume.summary, CONFIG.page.width - 2 * CONFIG.page.marginX);

  // Skills
  addSection("Skills");
  addTextBlock(
    resume.skills.join(", "),
    CONFIG.page.width - 2 * CONFIG.page.marginX
  );

  // Experience
  addSection("Experience");
  resume.experience.forEach((job: any) => {
    // Company Name
    doc
      .setFontSize(CONFIG.fonts.size.section)
      .setFont(CONFIG.fonts.main, "bold")
      .setTextColor(...CONFIG.colors.secondary);
    doc.text(job.company, CONFIG.page.marginX, y);
    y += CONFIG.spacing.textBlock;

    // Roles
    job.roles.forEach((role: any) => {
      // Role Title and Dates
      doc
        .setFontSize(CONFIG.fonts.size.text)
        .setFont(CONFIG.fonts.main, "bold")
        .setTextColor(...CONFIG.colors.accent);
      doc.text(
        `${role.title} (${role.start_date} - ${role.end_date})`,
        CONFIG.page.marginX,
        y
      );
      y += CONFIG.spacing.textBlock;

      // Responsibilities
      doc.setFont(CONFIG.fonts.main, "normal").setTextColor(0, 0, 0);
      addBulletPoints(
        role.responsibilities,
        CONFIG.page.width - 2 * CONFIG.page.marginX
      );
    });

    // Add a horizontal line between jobs
    doc.setDrawColor(200, 200, 200); // Light gray line
    doc.line(
      CONFIG.page.marginX,
      y,
      CONFIG.page.width - CONFIG.page.marginX,
      y
    );
    y += CONFIG.spacing.jobGap; // Extra spacing between jobs
  });

  // Education
  addSection("Education");
  resume.education.forEach((edu: any) => {
    doc
      .setFontSize(CONFIG.fonts.size.section)
      .setFont(CONFIG.fonts.main, "bold")
      .setTextColor(...CONFIG.colors.secondary);
    doc.text(edu.institution, CONFIG.page.marginX, y);
    y += CONFIG.spacing.textBlock;

    doc
      .setFontSize(CONFIG.fonts.size.text)
      .setFont(CONFIG.fonts.main, "italic")
      .setTextColor(...CONFIG.colors.accent);
    doc.text(
      `${edu.degree} (${edu.start_date} - ${edu.end_date})`,
      CONFIG.page.marginX,
      y
    );
    y += CONFIG.spacing.sectionTitle;
  });

  // Save PDF
  doc.save(`${resume.name.replace(" ", "_")}_Resume.pdf`);
  setIsLoading(false);
}
