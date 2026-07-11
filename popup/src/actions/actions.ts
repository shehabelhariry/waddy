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

    downloadText(letter, `${jobData.company}.txt`);
  } catch (err) {
    console.error("Cover letter generation failed:", err);
    alert(
      "Couldn't generate the cover letter. Check your API key and model in Settings."
    );
  } finally {
    setLoading(false);
  }
};
