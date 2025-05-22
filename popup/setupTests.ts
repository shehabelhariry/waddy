// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock import.meta.env for Vite environment variables
globalThis.import = {
  meta: {
    env: {
      VITE_OPENAI_API_KEY: 'test-api-key-from-setup',
      // Add any other VITE_ variables that your code might access
    },
  },
} as any; // Use 'as any' to avoid TypeScript errors for the mock structure
