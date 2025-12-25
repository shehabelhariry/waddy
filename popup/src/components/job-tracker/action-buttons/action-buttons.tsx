import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import UploadCVButton from "./upload-cv-button";
import { CvType } from "../../../baseCV";
import CreateTailoredCVButton from "./create-tailored-cv-button";
import { JobData } from "../../../types";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
  return (
    <div className="button-container">
      {!cvObject ? <UploadCVButton setCvObject={setCvObject} /> : null}
      {cvObject && jobData && (
        <CreateTailoredCVButton cvObject={cvObject} jobData={jobData} />
      )}
    </div>
  );
}
