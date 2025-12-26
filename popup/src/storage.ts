import { CvType } from "./baseCV";
import { chrome } from "./const";

const CV_STORAGE_KEY = "waddyCV" as const;
const OPEN_AI_API_KEY_STORAGE_KEY = "waddyOpenAIApiKey" as const;

const CHROME_STORAGE_POLICY: "sync" | "local" = "sync";

async function setCvInStorage(cv: CvType | undefined) {
  storage(CV_STORAGE_KEY).set(JSON.stringify(cv));
}

async function getCvFromStorage() {
  const cvString = await storage(CV_STORAGE_KEY).get();
  if (cvString) {
    return JSON.parse(cvString) as CvType;
  }
  return undefined;
}

async function removeCvFromStorage() {
  await storage(CV_STORAGE_KEY).clear();
}

// Handle OpenAI API Key Storage
async function setApiKeyInStorage(apiKey: string | null) {
  storage(OPEN_AI_API_KEY_STORAGE_KEY).set(JSON.stringify(apiKey));
}

async function getApiKeyFromStorage() {
  const apiKeyString = await storage(OPEN_AI_API_KEY_STORAGE_KEY).get();
  if (apiKeyString) {
    return JSON.parse(apiKeyString) as string | null;
  }
  return null;
}

function storage(
  key: typeof CV_STORAGE_KEY | typeof OPEN_AI_API_KEY_STORAGE_KEY
) {
  if (chrome?.storage?.[key]) {
    // Could be 'sync' or 'local'
    const storageHandler = chrome.storage[CHROME_STORAGE_POLICY];
    return {
      set: (value: string) => {
        storageHandler.set({
          [CV_STORAGE_KEY]: value,
        });
      },
      get: async () => {
        const result = await storageHandler.get([key]);
        return result[key];
      },
      clear: async () => {
        await storageHandler.clear();
      },
    };
  }

  return {
    set: (value: string) => localStorage.setItem(key, value),
    get: () => localStorage.getItem(key) || undefined,
    clear: () => localStorage.removeItem(key),
  };
}

export {
  setCvInStorage,
  getCvFromStorage,
  removeCvFromStorage,
  setApiKeyInStorage,
  getApiKeyFromStorage,
};
