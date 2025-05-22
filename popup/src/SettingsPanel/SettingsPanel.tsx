import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message } from 'antd';

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ visible, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (visible) {
      // Load API key from localStorage when panel becomes visible
      const storedApiKey = localStorage.getItem('openai_api_key');
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
    }
  }, [visible]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      message.error('API Key cannot be empty.');
      return;
    }
    onSave(apiKey);
    message.success('API Key saved!');
    onClose(); // Close panel after save
  };

  const handleModalClose = () => {
    // Reset apiKey state if user closes without saving, only if it wasn't saved before
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey !== apiKey) {
      setApiKey(storedApiKey || ''); // Reset to stored or empty
    }
    onClose();
  }

  return (
    <Modal
      title="Settings"
      visible={visible}
      onCancel={handleModalClose}
      footer={[
        <Button key="back" onClick={handleModalClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Input
        placeholder="Enter your OpenAI API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <p style={{ fontSize: '12px', color: 'gray' }}>
        Your API key is stored locally and only used to communicate with the OpenAI API.
      </p>
    </Modal>
  );
};

export default SettingsPanel;
