import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getApiKeyFromStorage, getModelIdFromStorage } from "../storage";
import { DEFAULT_MODEL_ID, getProviderForModel } from "./models";

// Provider-agnostic entry point for every LLM call in the extension. The
// signature is intentionally unchanged from the old utils.ts implementation so
// all call sites (actions.ts, create-tailored-cv-button.tsx) stay the same.
export const callLLM = async ({
  system,
  prompt,
}: {
  system: string;
  prompt: string;
}): Promise<string> => {
  const apiKey = await getApiKeyFromStorage();
  if (!apiKey) {
    throw new Error("No API key set. Add your key in Settings.");
  }

  const modelId = (await getModelIdFromStorage()) || DEFAULT_MODEL_ID;
  const provider = getProviderForModel(modelId);

  let model;
  switch (provider) {
    case "openrouter":
      model = createOpenRouter({ apiKey })(modelId);
      break;
    // Future native providers (openai/anthropic/google) plug in here.
    default:
      throw new Error(`Provider "${provider}" is not supported yet.`);
  }

  const { text } = await generateText({
    model,
    system,
    prompt,
    maxOutputTokens: 5000,
  });

  return text.trim();
};
