import UploadCVButton from "./upload-cv-button";
import { CvType } from "../../../baseCV";
import CreateTailoredCVButton from "./create-tailored-cv-button";
import { JobData } from "../../../types";
import { isDebugMode } from "../../../const";

interface ActionButtonsProps {
  setCvObject: (cv: CvType | undefined) => void;
  cvObject?: CvType | null;
  jobData?: JobData;
}

export default function ActionButtons({
  setCvObject,
  cvObject,
  jobData,
}: ActionButtonsProps) {
  const shouldShowCreateTailoredCVButton = (cvObject && jobData) || isDebugMode;

  return (
    <div className="button-container">
      {!cvObject ? <UploadCVButton setCvObject={setCvObject} /> : null}

      {shouldShowCreateTailoredCVButton && (
        <CreateTailoredCVButton cvObject={cvObject} jobData={jobData} />
      )}
    </div>
  );
}
