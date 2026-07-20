// Shared AI Gateway helper (server-only import contexts)
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createAI(structured = false) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: structured,
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export const CHAT_MODEL = "google/gemini-2.5-flash";
export const REASONING_MODEL = "google/gemini-2.5-pro";
export const VISION_MODEL = "google/gemini-2.5-flash";
