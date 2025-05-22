import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobTracker from './JobTracker';
import { act } from 'react'; // Import act for state updates

// Mock ../utils directly within the test file
jest.mock('../utils', () => ({
  callLLM: jest.fn(async (args: { system?: string; prompt: string }) => {
    if (args.prompt.includes("customizedResume.txt")) {
      return Promise.resolve("<new_cv>{}</new_cv>");
    }
    return Promise.resolve("Mocked LLM response");
  }),
  extractTextBetweenTags: (text: string, tag: string) => {
    const startTag = `<${tag}>`;
    const endTag = `</${tag}>`;
    const startIndex = text.indexOf(startTag);
    const endIndex = text.indexOf(endTag);
    if (startIndex !== -1 && endIndex !== -1) {
      return text.substring(startIndex + startTag.length, endIndex);
    }
    return null;
  },
  loadPrompt: jest.fn(async (promptName: string, variables: Record<string, string>) => {
    let content = `Mock prompt content for ${promptName}.`;
    for (const key in variables) {
      content += ` ${key}: ${variables[key]}`;
    }
    return Promise.resolve(content);
  }),
}));

// Mock chrome API
const mockChrome = {
  tabs: {
    query: jest.fn((options, callback) => callback([{ id: 1 }])),
    sendMessage: jest.fn(),
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    sendMessage: jest.fn(),
  },
  storage: {
    local: {
      get: jest.fn((keys, callback) => callback({})), // Default to empty storage
      set: jest.fn((items, callback) => {
        if (callback) {
          callback();
        }
      }),
    },
  },
};

// @ts-ignore
global.chrome = mockChrome;

// Mock for assets, e.g., logo
jest.mock('../assets/logo_non_transparent.png', () => 'mock-logo.png');


describe('JobTracker Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockChrome.storage.local.get.mockImplementation((keys, callback) => callback({}));
    mockChrome.storage.local.set.mockImplementation((items, callback) => {
      if (callback) {
        callback();
      }
    });
    mockChrome.tabs.query.mockImplementation((options, callback) => callback([{ id: 1 }]));
    mockChrome.tabs.sendMessage.mockClear();
    mockChrome.runtime.onMessage.addListener.mockClear();
    mockChrome.runtime.onMessage.removeListener.mockClear();
  });

  test('renders without crashing', () => {
    render(<JobTracker />);
    expect(screen.getByAltText('Waddy Job applications logo')).toBeInTheDocument();
  });

  test('toggles OpenAI API key input field when settings icon is clicked', () => {
    render(<JobTracker />);
    const settingsIcon = screen.getByRole('img', { name: /setting/i }); // Ant Design icons might not have accessible names by default.

    // Initially, the input field should not be visible
    expect(screen.queryByLabelText(/OpenAI API Key/i)).not.toBeInTheDocument();

    // Click to show
    fireEvent.click(settingsIcon);
    expect(screen.getByLabelText(/OpenAI API Key/i)).toBeInTheDocument();

    // Click to hide
    fireEvent.click(settingsIcon);
    expect(screen.queryByLabelText(/OpenAI API Key/i)).not.toBeInTheDocument();
  });

  test('loads API key from chrome.storage.local on mount and displays it', async () => {
    const storedApiKey = 'test-api-key-from-storage';
    mockChrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ openaiApiKey: storedApiKey });
    });

    render(<JobTracker />);
    const settingsIcon = screen.getByRole('img', { name: /setting/i });
    fireEvent.click(settingsIcon); // Open the input

    const apiKeyInput = screen.getByLabelText(/OpenAI API Key/i) as HTMLInputElement;
    expect(apiKeyInput.value).toBe(storedApiKey);
  });

  test('saves API key to chrome.storage.local when input value changes', async () => {
    render(<JobTracker />);
    const settingsIcon = screen.getByRole('img', { name: /setting/i });
    fireEvent.click(settingsIcon); // Open the input

    const apiKeyInput = screen.getByLabelText(/OpenAI API Key/i);
    const newApiKey = 'new-test-api-key';

    await act(async () => {
      fireEvent.change(apiKeyInput, { target: { value: newApiKey } });
    });

    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
      { openaiApiKey: newApiKey },
      expect.any(Function) // Or undefined, depending on how rigorously you want to check the callback
    );
  });
});
