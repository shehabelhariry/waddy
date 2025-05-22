/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./setupTests.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.app.json', // Tell ts-jest to use this tsconfig
      },
    ],
  },
  moduleNameMapper: {
    // Mock CSS and image imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^jspdf$': '<rootDir>/__mocks__/jspdfMock.js', // Mock for jspdf
    // Removed mock for utils.ts as it will be handled by jest.mock() in the test file
  },
  // transformIgnorePatterns: [], // Reverted this change
};
