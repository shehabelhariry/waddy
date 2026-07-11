import { JobData } from "../types";
import { downloadText, extractTextBetweenTags, loadPrompt } from "../utils";
import { callLLM } from "../llm/client";
import { cvSample } from "../baseCV";

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

  setLoading(true);

  try {
    const prompt = await loadPrompt("coverLetter.txt", {
      company: jobData.company,
      location: jobData.location,
      description: jobData.description,
    });

    const response = await callLLM({
      system: `You are a personal consultant helping to draft a cover letter for ${jobData.company}`,
      prompt,
    });

    const letter = extractTextBetweenTags(response, "letter") || "";
    const score = extractTextBetweenTags(response, "grade") || null;

    setMatchScore(score);

    // Give the user the letter first, then persist (fire-and-forget).
    downloadText(letter, `${jobData.company}.txt`);
    handleSaveJob({ jobData, score, coverLetter: letter });
  } catch (err) {
    console.error("Cover letter generation failed:", err);
    alert(
      "Couldn't generate the cover letter. Check your API key and model in Settings."
    );
  } finally {
    setLoading(false);
  }
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
