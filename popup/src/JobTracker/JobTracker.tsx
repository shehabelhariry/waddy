import { useEffect, useState } from "react";
import { chrome } from "../const";
import { JobData } from "../types";
import { createCVPdf } from "../download";
import { callLLM, extractTextBetweenTags, loadPrompt } from "../utils";
import { DeleteFilled, InboxOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Flex, Input, message, Space, Spin, UploadProps } from "antd"; // Added Input
import Dragger from "antd/es/upload/Dragger";
import Logo from "../assets/logo_non_transparent.png";
import { runAssistantWithFileAndMessage } from "../run";
import { myBaseCV } from "../baseCV";

const JobTracker = () => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showOpenAiKeyInput, setShowOpenAiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState<string>(""); // State for API Key
  const [cvObject, setCvObject] = useState(() => {
    const item = localStorage.getItem("waddyCV");
    if (item) {
      return JSON.parse(item);
    }
  });

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

    // Retrieve API key from storage on mount
    chrome?.storage?.local.get(["openaiApiKey"], (result) => {
      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
      }
    });

    return () => {
      chrome?.runtime?.onMessage.removeListener();
    };
  }, []);

  // Handler for API key input change
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    chrome?.storage?.local.set({ openaiApiKey: newApiKey });
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    beforeUpload: () => {
      return false;
    },
    async onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        setLoading(true);
        const answer = await runAssistantWithFileAndMessage({
          file: info.file,
        });
        const cv = extractTextBetweenTags(answer, "new_cv")!;
        localStorage.setItem("waddyCV", cv);
        let cvObj = JSON.parse(cv);
        setCvObject(cvObj);
        setLoading(false);
      }
      if (status === "done") {
        console.log(info.file);
        // await summarizeCV({ formData: e.dataTransfer.files[0] });
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    async onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  // Handler for settings icon click
  const handleSettingsClick = () => {
    setShowOpenAiKeyInput(!showOpenAiKeyInput);
  };

  return (
    <div className="popup-container">
      <div className="settings-icon-container">
        <SettingOutlined
          style={{ fontSize: "24px", cursor: "pointer" }}
          onClick={handleSettingsClick} // Attached handler
        />
      </div>

      {/* Conditionally rendered OpenAI API Key Input */}
      {showOpenAiKeyInput && (
        <div className="api-key-input-container" style={{ marginBottom: "15px", width: "80%" }}>
          <label htmlFor="apiKeyInput" style={{ display: "block", marginBottom: "5px", color: "#e0e0e0" }}>
            OpenAI API Key:
          </label>
          <Input
            id="apiKeyInput"
            placeholder="Enter your OpenAI API Key"
            value={apiKey}
            onChange={handleApiKeyChange}
          />
        </div>
      )}

      <div className="logo-container">
        <img
          className="waddy-logo"
          src={Logo}
          alt="Waddy Job applications logo"
        />
      </div>

      {loading ? <p>⏳ Loading job details...</p> : null}

      {!loading && jobData ? (
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
      ) : null}

      <div className="button-container">
        {!cvObject ? (
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>

            {loading ? (
              <Flex justify="center" align="center">
                <Space>
                  <Spin />
                  <p>Preparing Your CV</p>
                </Space>
              </Flex>
            ) : (
              <>
                <p className="ant-upload-text">Upload your CV</p>
                <p className="ant-upload-hint">
                  Upload your CV here to get Started and Waddy!
                </p>
              </>
            )}
          </Dragger>
        ) : null}
        {cvObject ? (
          <>
            <p>
              {`${cvObject.name}.pdf`}{" "}
              <DeleteFilled
                onClick={() => {
                  localStorage.removeItem("waddyCV");
                  setCvObject(undefined);
                }}
              />
            </p>
            {/* <Button
              className="ai-button"
              loading={isAiLoading}
              onClick={() =>
                handleCoverLetter(jobData!, setIsAiLoading, setMatchScore)
              }
            >
              Rate your CV
            </Button> */}
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

                let resume: typeof myBaseCV = JSON.parse(
                  extractTextBetweenTags(resp, "new_cv") || "{}"
                );

                createCVPdf(resume);
                setIsAiLoading(false);
              }}
            >
              Generate A Tailored CV
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default JobTracker;
