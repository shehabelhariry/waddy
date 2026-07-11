// Registry of models the extension can talk to.
//
// For now every model is served through OpenRouter (one user key unlocks all of
// them). The `provider` field is the extension point: when we add native
// providers later (OpenAI/Anthropic/Google direct), give those entries a
// different provider and handle it in llm/client.ts — nothing else changes.

export type Provider = "openrouter"; // future: | "openai" | "anthropic" | "google"

export interface ModelOption {
  /** Model id sent to the provider (OpenRouter id, e.g. "openai/gpt-4.1-mini"). */
  id: string;
  /** Human-friendly label for the Settings dropdown. */
  label: string;
  provider: Provider;
}

// Curated shortlist. The Settings dropdown also allows free-text entry, so any
// valid OpenRouter id works even if it isn't listed here.
export const AVAILABLE_MODELS: ModelOption[] = [
  { id: "openai/gpt-4.1-mini", label: "OpenAI · GPT-4.1 mini", provider: "openrouter" },
  { id: "openai/gpt-4.1", label: "OpenAI · GPT-4.1", provider: "openrouter" },
  { id: "anthropic/claude-sonnet-4", label: "Anthropic · Claude Sonnet 4", provider: "openrouter" },
  { id: "google/gemini-2.5-flash", label: "Google · Gemini 2.5 Flash", provider: "openrouter" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Meta · Llama 3.3 70B", provider: "openrouter" },
];

// Matches the model the extension used before this change.
export const DEFAULT_MODEL_ID = "openai/gpt-4.1-mini";

/** Which provider serves a given model id. Unknown ids default to OpenRouter. */
export function getProviderForModel(modelId: string): Provider {
  return AVAILABLE_MODELS.find((m) => m.id === modelId)?.provider ?? "openrouter";
}
