# Land Your Job (Waddy) Chrome Extension 

## Overview

"Land Your Job" is a Chrome extension designed to streamline the job application process on LinkedIn. It enables users to track and manage job applications efficiently by extracting job details, tailoring CVs, and generating cover letters directly within the browser.

## Key Features

1. **Job Data Extraction**:

   - Automatically extracts job details (title, company, location, description, etc.) from LinkedIn job postings.
   - Uses content scripts to interact with LinkedIn's DOM and retrieve relevant information.

2. **CV Management**:

   - Allows users to upload their CVs in PDF format.
   - Extracts text from the uploaded CV and converts it into a structured JSON format.
   - Stores the CV data locally or in Chrome's sync storage for easy access.

3. **Tailored CV Generation**:

   - Integrates with OpenAI's GPT API to generate tailored CVs based on the job description.
   - Reorganizes and rephrases CV content to highlight relevant skills and experiences.

4. **Cover Letter Generation**:

   - Drafts personalized cover letters using OpenAI's GPT API.
   - Grades job opportunities and provides a match score to help users prioritize applications.

5. **Google Sheets Integration**:
   - Saves job application details, including cover letters and match scores, to a Google Sheet for tracking purposes.

## Technical Details

### Manifest

- The extension uses Manifest V3.
- Permissions include `activeTab`, `storage`, and `scripting`.
- Content scripts are injected into LinkedIn job pages to extract job data.

### Frontend

- Built with React and TypeScript.
- Uses Ant Design for UI components.
- Vite is used as the build tool.

### Backend Logic

- Content scripts (`content.js`) handle job data extraction.
- Background scripts (`background.js`) manage communication with OpenAI's GPT API.
- Utility functions handle tasks like text extraction, API calls, and PDF generation.

### Prompts

- The extension uses predefined text prompts stored in the `src/prompts` directory to interact with OpenAI's GPT API.
- Prompts are dynamically populated with user data and job descriptions.

### Storage

- Chrome's sync storage is used to store CV data.
- Local storage is used as a fallback.

### Dependencies

- `react`, `react-dom`, `antd`: For building the user interface.
- `pdf-lib`, `pdfjs-dist`: For handling PDF uploads and text extraction.
- `vite-plugin-static-copy`: For copying prompt files to the build directory.

## File Structure

### Root Directory

- `manifest.json`: Defines the extension's metadata and permissions.
- `background.js`: Handles background tasks and communication with OpenAI.
- `content.js`: Extracts job data from LinkedIn pages.

### Popup Directory

- `src/`: Contains the source code for the popup interface.
  - `components/`: React components for the job tracker and action buttons.
  - `prompts/`: Text prompts for OpenAI interactions.
  - `utils.ts`: Utility functions for API calls and text processing.
  - `storage.ts`: Handles CV data storage.
  - `download.ts`: Generates tailored CVs as PDFs.

### Build Configuration

- `vite.config.ts`: Configures the Vite build tool.
- `tsconfig.json`: TypeScript configuration files.

## How It Works

1. **Job Data Extraction**:

   - When a user visits a LinkedIn job page, the content script extracts job details and sends them to the popup interface.

2. **CV Upload**:

   - Users upload their CVs in the popup interface.
   - The CV is parsed, converted to JSON, and stored locally.

3. **Tailored CV Generation**:

   - Users click a button to generate a tailored CV for the job.
   - The extension sends the CV and job description to OpenAI's GPT API and receives a tailored CV in response.

4. **Cover Letter Generation**:

   - Users can generate a cover letter for the job using a similar process.

5. **Job Tracking**:
   - Job details, tailored CVs, and cover letters are saved to a Google Sheet for tracking.

## Future Enhancements

- Support for additional job boards beyond LinkedIn.
- Enhanced analytics for job tracking.
- Integration with other productivity tools like Trello or Notion.

## Getting Started

### Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.
4. Load the extension in Chrome:
   - Go to `chrome://extensions`.
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `dist` directory.

### Usage

1. Navigate to a LinkedIn job posting.
2. Open the extension popup.
3. Upload your CV and generate tailored CVs and cover letters.
4. Save job details to Google Sheets.

---

This documentation provides a high-level overview of the "Land Your Job" Chrome extension. For detailed implementation, refer to the source code.
