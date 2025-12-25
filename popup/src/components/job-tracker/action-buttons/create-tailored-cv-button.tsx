import { DeleteFilled } from "@ant-design/icons";
import { removeCvFromStorage } from "../../../storage";
import { CvType } from "../../../baseCV";
import { callLLM, extractTextBetweenTags, loadPrompt } from "../../../utils";
import { createCVPdf } from "../../../download";
import { Button } from "antd";
import { useState } from "react";
import { JobData } from "../../../types";

interface CreateTailoredCVButtonProps {
  cvObject: CvType;
  setCvObject: (cv: CvType | undefined) => void;
  jobData: JobData;
}

export default function CreateTailoredCVButton({
  cvObject,
  jobData,
  setCvObject,
}: CreateTailoredCVButtonProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);

  return (
    <>
      <p>
        {`${cvObject.name}.pdf`}{" "}
        <DeleteFilled
          onClick={() => {
            removeCvFromStorage();
            setCvObject(undefined);
          }}
        />
      </p>

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

          createCVPdf(resume);
          setIsAiLoading(false);
        }}
      >
        Generate A Tailored CV
      </Button>
    </>
  );
}
