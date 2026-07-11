import { CV } from "./actions/generate-resume/types";
import { chrome } from "./const";

const CV_STORAGE_KEY = "waddyCV" as const;
const API_KEY_STORAGE_KEY = "waddyApiKey" as const;
const MODEL_ID_STORAGE_KEY = "waddyModelId" as const;

type StorageKey =
  | typeof CV_STORAGE_KEY
  | typeof API_KEY_STORAGE_KEY
  | typeof MODEL_ID_STORAGE_KEY;

const CHROME_STORAGE_POLICY: "sync" | "local" = "sync";

async function setCvInStorage(cv: CV | undefined) {
  storage(CV_STORAGE_KEY).set(JSON.stringify(cv));
}

async function getCvFromStorage() {
  const cvString = await storage(CV_STORAGE_KEY).get();
  if (cvString) {
    return JSON.parse(cvString) as CV;
  }
  return undefined;
}

async function removeCvFromStorage() {
  await storage(CV_STORAGE_KEY).clear();
}

// Handle API Key Storage
async function setApiKeyInStorage(apiKey: string | null) {
  if (apiKey === null) return;
  storage(API_KEY_STORAGE_KEY).set(apiKey);
}

async function getApiKeyFromStorage() {
  const apiKeyString = await storage(API_KEY_STORAGE_KEY).get();
  if (apiKeyString) {
    return apiKeyString;
  }
  return null;
}

// Handle selected model id storage
async function setModelIdInStorage(modelId: string | null) {
  if (modelId === null) return;
  storage(MODEL_ID_STORAGE_KEY).set(modelId);
}

async function getModelIdFromStorage() {
  const modelId = await storage(MODEL_ID_STORAGE_KEY).get();
  if (modelId) {
    return modelId;
  }
  return null;
}

function storage(key: StorageKey) {
  if (chrome?.storage?.[CHROME_STORAGE_POLICY]) {
    // Could be 'sync' or 'local'
    const storageHandler = chrome.storage[CHROME_STORAGE_POLICY];
    return {
      set: (value: string) => {
        storageHandler.set({ [key]: value });
      },
      get: async () => {
        const result = await storageHandler.get([key]);
        return result[key];
      },
      clear: async () => {
        await storageHandler.remove([key]);
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
  setModelIdInStorage,
  getModelIdFromStorage,
};
