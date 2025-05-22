import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobTracker from './JobTracker';

// Mock the SettingsPanel component
jest.mock('../SettingsPanel/SettingsPanel', () => {
  return jest.fn(({ visible, onClose }) =>
    visible ? (
      <div data-testid="mock-settings-panel">
        <button onClick={onClose}>Close Mock Panel</button>
      </div>
    ) : null
  );
});

// Mock child components or services that are not directly under test
jest.mock('../run', () => ({
  runAssistantWithFileAndMessage: jest.fn(),
}));

jest.mock('../download', () => ({
  createCVPdf: jest.fn(),
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'), // Import and retain original implementations
  callLLM: jest.fn().mockResolvedValue("cv data"), // Mock only callLLM
  loadPrompt: jest.fn().mockResolvedValue("prompt data"),
}));


describe('JobTracker Component', () => {
  beforeEach(() => {
    // Reset localStorage and mocks before each test
    localStorage.clear();
    jest.clearAllMocks();
    // @ts-ignore
    global.chrome.runtime.onMessage.addListener.mockClear();
    // @ts-ignore
    global.chrome.tabs.query.mockClear();

     // Mock initial job data message
     // @ts-ignore
     global.chrome.runtime.onMessage.addListener.mockImplementation((listener) => {
      // Simulate receiving a job data message shortly after component mounts
      setTimeout(() => {
        listener({ action: 'DATA_EXTRACTED', data: { current: { title: 'Test Job', company: 'Test Co', location: 'Testville', imageUrl: 'test.png', description: 'A test job.' } } });
      }, 0);
    });
  });

  test('renders settings button', () => {
    render(<JobTracker />);
    const settingsButton = screen.getByRole('button', { name: /setting/i });
    expect(settingsButton).toBeInTheDocument();
  });

  test('clicking settings button toggles SettingsPanel visibility', () => {
    render(<JobTracker />);
    const settingsButton = screen.getByRole('button', { name: /setting/i });

    // Panel should not be visible initially
    expect(screen.queryByTestId('mock-settings-panel')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(settingsButton);
    expect(screen.getByTestId('mock-settings-panel')).toBeInTheDocument();

    // Click the "Close Mock Panel" button (simulating onClose)
    const closeButtonInMockPanel = screen.getByText('Close Mock Panel');
    fireEvent.click(closeButtonInMockPanel);
    expect(screen.queryByTestId('mock-settings-panel')).not.toBeInTheDocument();
  });

  test('loads CV from localStorage and displays its name', async () => {
    const cvData = { name: 'MyTestCV', content: '...' };
    localStorage.setItem('waddyCV', JSON.stringify(cvData));
    render(<JobTracker />);
    // Wait for potential async operations or state updates
    expect(await screen.findByText('MyTestCV.pdf')).toBeInTheDocument();
  });

  test('shows upload dragger when no CV is in localStorage', () => {
    render(<JobTracker />);
    expect(screen.getByText(/upload your cv/i)).toBeInTheDocument();
  });
});
