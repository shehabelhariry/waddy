import { cvSample } from "../../../baseCV";
import { extractTextBetweenTags, loadPrompt } from "../../../utils";
import { callLLM } from "../../../llm/client";
import { Button } from "antd";
import { useState } from "react";
import { JobData } from "../../../types";
import { generateResumePdf } from "../../../actions/generate-resume/generate-resume";
import { isDebugMode } from "../../../const";
import { CV } from "../../../actions/generate-resume/types";

interface CreateTailoredCVButtonProps {
  cvObject?: CV | null;
  jobData?: JobData;
}

export default function CreateTailoredCVButton({
  cvObject,
  jobData,
}: CreateTailoredCVButtonProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);

  if ((!cvObject || !jobData) && !isDebugMode) return null;

  return (
    <Button
      className="ai-button"
      loading={isAiLoading}
      onClick={async () => {
        // Debug mode to test resume generation without LLM calls
        if (isDebugMode) {
          generateResumePdf(cvSample);
          return;
        }

        setIsAiLoading(true);
        try {
          const prompt = await loadPrompt("customizedResume.txt", {
            cv: JSON.stringify(cvObject, null, 2),
            job: jobData?.description!,
          });

          const resp = await callLLM({
            system: "you are a consultant specialized in creating CVs",
            prompt: prompt,
          });

          const resume: CV = JSON.parse(
            extractTextBetweenTags(resp, "new_cv") || "{}"
          );

          generateResumePdf(resume);
        } catch (err) {
          console.error("Tailored CV generation failed:", err);
          alert(
            "Couldn't generate the tailored CV. Check your API key and model in Settings."
          );
        } finally {
          setIsAiLoading(false);
        }
      }}
    >
      Generate A Tailored CV
    </Button>
  );
}
