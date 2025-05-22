import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ choices: [{ message: { content: "mocked response" } }] }),
    text: () => Promise.resolve("mocked text response"), // for loadPrompt
    ok: true,
  })
) as jest.Mock;


// Mock chrome extension APIs
if (typeof global.chrome === 'undefined') {
  global.chrome = {
    // @ts-ignore
    runtime: {
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
    // @ts-ignore
    tabs: {
      query: jest.fn((queryInfo, callback) => {
        // Simulate finding an active tab
        if (callback) {
          callback([{ id: 1 }]);
        }
      }),
      sendMessage: jest.fn(),
    },
  } as any;
}

// Mock import.meta.env
// In Jest, import.meta is not directly available.
// We need to mock it. This is a common approach for Vite projects.
// Ensure this setup is run before tests by including it in jest.config.js setupFilesAfterEnv
jest.mock('./src/const', () => ({
  ...jest.requireActual('./src/const'),
  chrome: global.chrome,
}));


// Mock antd components that cause issues with Jest or are not relevant to the test
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    Upload: {
      ...antd.Upload,
      Dragger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  };
});

// Mock assets
jest.mock('./src/assets/logo_non_transparent.png', () => 'mock-logo.png');
