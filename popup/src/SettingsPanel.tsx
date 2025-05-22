import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { chrome } from '../const'; // Assuming chrome const is needed and path is correct

interface SettingsPanelProps {
  visible: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ visible }) => {
  const [apiKey, setApiKey] = useState<string>(""); // State for API Key

  // Retrieve API key from storage on mount or when panel becomes visible
  useEffect(() => {
    if (visible) { // Only load if panel is visible
      chrome?.storage?.local.get(["openaiApiKey"], (result) => {
        if (result.openaiApiKey) {
          setApiKey(result.openaiApiKey);
        }
      });
    }
  }, [visible]);

  // Handler for API key input change
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    chrome?.storage?.local.set({ openaiApiKey: newApiKey });
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="settings-panel"> {/* Removed inline styles, using class from index.css */}
      <h3>Settings</h3>
      <div className="api-key-input-container" style={{ marginTop: "15px", marginBottom: "15px", width: "90%", margin: "0 auto" }}>
        <label htmlFor="settingsApiKeyInput" style={{ display: "block", marginBottom: "5px", color: "#e0e0e0" }}>
          OpenAI API Key:
        </label>
        <Input
          id="settingsApiKeyInput" // Changed ID to avoid potential duplicates if JobTracker still had one
          placeholder="Enter your OpenAI API Key"
          value={apiKey}
          onChange={handleApiKeyChange}
        />
      </div>
      {/* More settings will go here */}
    </div>
  );
};

export default SettingsPanel;
