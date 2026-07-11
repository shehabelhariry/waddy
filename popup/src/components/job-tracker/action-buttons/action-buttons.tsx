import UploadCVButton from "./upload-cv-button";
import CreateTailoredCVButton from "./create-tailored-cv-button";
import { JobData } from "../../../types";
import { isDebugMode } from "../../../const";
import { CV } from "../../../actions/generate-resume/types";

interface ActionButtonsProps {
  setCvObject: (cv: CV | undefined) => void;
  cvObject?: CV | null;
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
