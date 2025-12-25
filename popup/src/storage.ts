import { CvType } from "./baseCV";
import { chrome } from "./const";

const CV_STORAGE_KEY = "waddyCV";

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
  if (chrome?.storage?.local) {
    return {
      set: (value: string) => {
        chrome?.storage?.sync.set({
          [CV_STORAGE_KEY]: value,
        });
      },
      get: async () => {
        const result = await chrome?.storage?.local.get([CV_STORAGE_KEY]);
        return result[CV_STORAGE_KEY];
      },
      clear: async () => {
        await chrome?.storage?.local.clear();
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
