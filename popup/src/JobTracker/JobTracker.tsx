import { useEffect, useState } from "react";
import { chrome } from "../const";
import { JobData } from "../types";
import { handleCoverLetter } from "../actions";

const JobTracker = () => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [matchScore, setMatchScore] = useState(null);


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
        setLoading(false);
      }
    });

    return () => {
      chrome?.runtime?.onMessage.removeListener();
    };
  }, []);

  return (
    <div className="popup-container">
      <h1 className="ai-title">🚀 AI Job Tracker</h1>

      {loading ? (
        <p>⏳ Loading job details...</p>
      ) : (
        <div className="job-card">
          <img
            src={jobData?.imageUrl}
            alt="Company Logo"
            className="job-logo"
          />
          <h2 className="job-title">{jobData?.title}</h2>
          <h3 className="company-name">{jobData?.company}</h3>
          <p className="job-location">Location: {jobData?.location}</p>
        </div>
      )}

      {matchScore !== null && <p>✅ Match Score: {matchScore} / 10</p>}

      <div className="button-container">
        <button
          className="ai-button"
          onClick={() => handleCoverLetter(jobData!, setIsAiLoading, setMatchScore)}
        >
          {isAiLoading ?" Loading": "🤖 Do your AI thingy"}
        </button>
      </div>
    </div>
  );
};

export default JobTracker;
