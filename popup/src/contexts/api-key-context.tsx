import { createContext, useContext, useEffect, useState } from "react";
import { getApiKeyFromStorage, setApiKeyInStorage } from "../storage";

type ApiKeyContextType = {
  openApiKey: string | null;
  setOpenApiKey: (key: string | null) => void;
};
const ApiKeyContext = createContext<ApiKeyContextType | null>(null);

export default ApiKeyContext;

export const ApiKeyProvider = ({ children }: { children: React.ReactNode }) => {
  const [openApiKey, setOpenApiKey] = useState<string | null>(
    () => import.meta.env.VITE_OPENAI_API_KEY || null
  );

  useEffect(() => {
    (async () => {
      if (openApiKey) return;
      const storedKey = await getApiKeyFromStorage();
      setOpenApiKey(storedKey);
    })();
  }, [openApiKey]);

  useEffect(() => {
    setApiKeyInStorage(openApiKey);
  }, [openApiKey]);

  return (
    <ApiKeyContext.Provider value={{ openApiKey, setOpenApiKey }}>
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
