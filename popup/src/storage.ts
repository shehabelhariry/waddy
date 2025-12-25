import { CvType } from "./baseCV";
import { chrome } from "./const";

const CV_STORAGE_KEY = "waddyCV";
const CHROME_STORAGE_POLICY: "sync" | "local" = "sync";

async function setCvInStorage(cv: CvType | undefined) {
  storage().set(JSON.stringify(cv));
}

async function getCvFromStorage() {
  const cvString = await storage().get();
  if (cvString) {
    return JSON.parse(cvString) as CvType;
  }
  return undefined;
}

async function removeCvFromStorage() {
  await storage().clear();
}

function storage() {
  if (chrome?.storage?.[CHROME_STORAGE_POLICY]) {
    // Could be 'sync' or 'local'
    const storageHandler = chrome.storage[CHROME_STORAGE_POLICY];
    return {
      set: (value: string) => {
        storageHandler.set({
          [CV_STORAGE_KEY]: value,
        });
      },
      get: async () => {
        const result = await storageHandler.get([CV_STORAGE_KEY]);
        return result[CV_STORAGE_KEY];
      },
      clear: async () => {
        await storageHandler.clear();
      },
    };
  }

  return {
    set: (value: string) => localStorage.setItem(CV_STORAGE_KEY, value),
    get: () => localStorage.getItem(CV_STORAGE_KEY) || undefined,
    clear: () => localStorage.removeItem(CV_STORAGE_KEY),
  };
}

export { setCvInStorage, getCvFromStorage, removeCvFromStorage };
