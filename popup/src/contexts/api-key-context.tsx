import { createContext, useContext, useEffect, useState } from "react";
import {
  getApiKeyFromStorage,
  setApiKeyInStorage,
  getModelIdFromStorage,
  setModelIdInStorage,
} from "../storage";
import { DEFAULT_MODEL_ID } from "../llm/models";

type ApiKeyContextType = {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  modelId: string;
  setModelId: (modelId: string) => void;
};
const ApiKeyContext = createContext<ApiKeyContextType | null>(null);

export default ApiKeyContext;

export const ApiKeyProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKey] = useState<string | null>(
    () =>
      import.meta.env.VITE_OPENROUTER_API_KEY ||
      import.meta.env.VITE_OPENAI_API_KEY ||
      null
  );
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);

  useEffect(() => {
    (async () => {
      if (apiKey) return;
      const storedKey = await getApiKeyFromStorage();
      setApiKey(storedKey);
    })();
  }, [apiKey]);

  useEffect(() => {
    setApiKeyInStorage(apiKey);
  }, [apiKey]);

  // Load the persisted model choice once on mount.
  useEffect(() => {
    (async () => {
      const storedModelId = await getModelIdFromStorage();
      if (storedModelId) setModelId(storedModelId);
    })();
  }, []);

  useEffect(() => {
    setModelIdInStorage(modelId);
  }, [modelId]);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, modelId, setModelId }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKeyContext = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKeyContext must be used within an ApiKeyProvider");
  }
  return context;
};
