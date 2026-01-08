import { JobData } from "../types";
import {
  callLLM,
  downloadText,
  extractTextBetweenTags,
  loadPrompt,
} from "../utils";
import { cvSample } from "../baseCV";
import { CV } from "./generate-resume/types";

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

interface HandleSaveJobArgs {
  jobData: JobData;
  score: string | null;
  coverLetter: string | null;
}

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

export const handleGenerateJobScore = async (
  jobDescription: string,
  cv: CV
) => {
  const prompt = await loadPrompt("generateJobScore.txt", {
    job_description: jobDescription,
    cv: JSON.stringify(cv, null, 2),
  });

  const response = await callLLM({
    system: `You are an expert career advisor who can rate how well a CV matches a job description.`,
    prompt,
  });

  const assessment = extractTextBetweenTags(response, "assessment") || "N/A";
  console.log("Job Match Assessment:", assessment);
};
