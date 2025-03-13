import { JobData } from "./types";
import {
  callLLM,
  downloadText,
  extractTextBetweenTags,
  loadPrompt,
} from "./utils";

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

  setLoading(false);

  downloadText(letter, `${jobData.company}.txt`);
};
