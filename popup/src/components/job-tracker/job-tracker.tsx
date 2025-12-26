import { useEffect, useState } from "react";
import { JobData } from "../../types";
import { chrome } from "../../const";
import { CvType } from "../../baseCV";
import JobCard from "./job-card";
import ActionButtons from "./action-buttons/action-buttons";
import { getCvFromStorage } from "../../storage";
import CvIndicator from "./cv-indicator";

const JobTracker = () => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [cvObject, setCvObject] = useState<CvType | undefined>(undefined);

  useEffect(() => {
    // Send message to content script to extract job data
    chrome?.tabs?.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "EXTRACT_DATA" });
      }
    });

    // Listen for extracted job data
    chrome?.runtime?.onMessage.addListener((message: any) => {
      if (message.action === "DATA_EXTRACTED") {
        setJobData(message.data.current);
      }
    });

    return () => {
      chrome?.runtime?.onMessage.removeListener();
    };
  }, []);

  // This can potentially be refactored
  useEffect(() => {
    const fetchCv = async () => {
      const cv = await getCvFromStorage();
      setCvObject(cv);
    };
    fetchCv();
  }, []);

  return (
    <div className="popup-container">
      <JobCard jobData={jobData} />
      {cvObject && (
        <CvIndicator cvObject={cvObject} setCvObject={setCvObject} />
      )}
      <ActionButtons
        setCvObject={setCvObject}
        cvObject={cvObject}
        jobData={jobData!}
      />
    </div>
  );
};

export default JobTracker;
