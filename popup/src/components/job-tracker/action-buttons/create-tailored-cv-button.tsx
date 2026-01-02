import { cvSample } from "../../../baseCV";
import { callLLM, extractTextBetweenTags, loadPrompt } from "../../../utils";
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
        const prompt = await loadPrompt("customizedResume.txt", {
          cv: JSON.stringify(cvObject, null, 2),
          job: jobData?.description!,
        });

        const resp = await callLLM({
          system: "you are a consultant specialized in creating CVs",
          prompt: prompt,
        });

        let resume: CV = JSON.parse(
          extractTextBetweenTags(resp, "new_cv") || "{}"
        );

        console.log("Generated Resume:", resume);

        generateResumePdf(resume);
        setIsAiLoading(false);
      }}
    >
      Generate A Tailored CV
    </Button>
  );
}
