# Waddy — Tailored Resumes & Cover Letters for LinkedIn

Waddy is a Chrome extension (Manifest V3) that turns your CV into a resume and
cover letter tailored to the exact LinkedIn job you're viewing — using the AI
model of your choice, with your own API key.

## Features

- **Job extraction** — reads the title, company, location, and description from
  the LinkedIn job page you're on (via a content script).
- **CV upload** — upload your CV as a PDF; its text is extracted in the browser
  and converted to a structured format, stored in your browser.
- **One-click generation** — the "Generate Resume & Cover Letter" button produces
  a tailored resume (PDF) and a cover letter (`.txt`), named
  `FirstName_LastName_Company_resume.pdf` / `..._cover_letter.txt`.
- **Bring your own model** — choose any model available through
  [OpenRouter](https://openrouter.ai) (OpenAI, Anthropic, Google, Llama, …) and
  supply your own OpenRouter API key.
- **Private by design** — there is no backend. Your data stays in your browser and
  is sent only to OpenRouter using your own key. See [`PRIVACY.md`](./PRIVACY.md).

## How it works

1. Open a LinkedIn job page. The content script (`content.js`) reads the job
   details and sends them to the popup.
2. Upload your CV once. It's parsed with `pdfjs`, structured by the model, and
   saved in `chrome.storage.sync`.
3. Click **Generate Resume & Cover Letter**. The popup sends your CV and the job
   description to your selected model via OpenRouter, then renders the resume to
   PDF (`pdfmake`) and downloads the cover letter.

## Tech stack

- **UI:** React 19 + TypeScript + Ant Design, bundled with Vite.
- **LLM:** [Vercel AI SDK](https://sdk.vercel.ai) (`ai`) with
  `@openrouter/ai-sdk-provider`, behind a small provider-agnostic layer
  (`popup/src/llm/`) so native providers can be added later without a rewrite.
- **PDF:** `pdfmake` (generate resume), `pdfjs-dist` (read uploaded CV). Both are
  lazy-loaded so they stay out of the popup's initial bundle.

## Project structure

```
manifest.json            Extension manifest (root of the unpacked extension)
background.js            Minimal service worker
content.js              Reads job details from LinkedIn job pages
small_logo.png          Toolbar / store icon
package-extension.sh    Builds the popup and zips the extension for the store
popup/                   React app (the popup UI)
  src/
    llm/                LLM client + model registry (OpenRouter)
    actions/            Cover-letter flow + resume PDF generation
    components/         Job tracker, action buttons, settings
    prompts/            Prompt templates (copied into dist/prompts on build)
    storage.ts          chrome.storage.sync for CV, API key, model
    utils.ts            Prompt loading, tag parsing, downloads
  dist/                  Build output (referenced by the manifest)
```

## Getting started (development)

Requirements: a recent Node.js and an [OpenRouter API key](https://openrouter.ai/keys).

```bash
cd popup
npm install
npm run dev     # dev server (enables a debug bypass via VITE_DEBUG_MODE)
```

To build the popup:

```bash
cd popup
npm run build   # outputs to popup/dist
```

### Load the extension in Chrome

1. Build the popup (above) so `popup/dist` exists.
2. Go to `chrome://extensions`, enable **Developer mode**.
3. Click **Load unpacked** and select the **repository root** (the folder
   containing `manifest.json`).

### Configure

Open the extension popup → **Settings**, paste your **OpenRouter API key**, and
pick a **model**. No `.env` file is needed — the key is entered by the user and
stored in `chrome.storage.sync`.

## Packaging for the Chrome Web Store

```bash
./package-extension.sh
```

This builds the popup and produces `waddy-extension.zip` containing only the
runtime files (`manifest.json`, `background.js`, `content.js`, `small_logo.png`,
and `popup/dist`). Bump `"version"` in `manifest.json` before uploading a new
build. The zip is git-ignored.

## Privacy

Waddy operates no server and never receives your data. Your CV, API key, and job
data stay in your browser; the only external requests are to OpenRouter, using
your own key. Full details in [`PRIVACY.md`](./PRIVACY.md).
