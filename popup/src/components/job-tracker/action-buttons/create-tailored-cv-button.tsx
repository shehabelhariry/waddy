import { CvType } from "../../../baseCV";
import { callLLM, extractTextBetweenTags, loadPrompt } from "../../../utils";
import { Button } from "antd";
import { useState } from "react";
import { JobData } from "../../../types";
import { generateResumePdf } from "../../../actions/generate-resume";

interface CreateTailoredCVButtonProps {
  cvObject: CvType;
  jobData: JobData;
}

export default function CreateTailoredCVButton({
  cvObject,
  jobData,
}: CreateTailoredCVButtonProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);

  return (
    <Button
      className="ai-button"
      loading={isAiLoading}
      onClick={async () => {
        setIsAiLoading(true);
        const prompt = await loadPrompt("customizedResume.txt", {
          cv: JSON.stringify(cvObject, null, 2),
          job: jobData?.description!,
        });

        const resp = await callLLM({
          system: "you are a consultant specialized in creating CVs",
          prompt: prompt,
        });

        let resume: CvType = JSON.parse(
          extractTextBetweenTags(resp, "new_cv") || "{}"
        );

        generateResumePdf(resume);
        setIsAiLoading(false);
      }}
    >
      Generate A Tailored CV
    </Button>
  );
}
