import { useEffect, useState } from "react";
import Logo from "../../assets/logo_non_transparent.png";

import { JobData } from "../../types";
import { chrome } from "../../const";
import { CvType } from "../../baseCV";
import JobCard from "./job-card";
import ActionButtons from "./action-buttons/action-buttons";
import { getCvFromStorage } from "../../storage";
import CvIndicator from "./cv-indicator";
import { Link, Outlet } from "react-router";
import { HomeFilled, SettingFilled } from "@ant-design/icons";

const JobTracker = () => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [cvObject, setCvObject] = useState<CvType | undefined>(undefined);
  const [openApiKey, setOpenApiKey] = useState<string | null>(
    import.meta.env.VITE_OPENAI_API_KEY || null
  );

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
