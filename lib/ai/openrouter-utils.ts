import type { OpenRouterModel } from "@/types";

export function groupModelsByProvider(models: OpenRouterModel[]): Record<string, OpenRouterModel[]> {
  return models.reduce(
    (acc, model) => {
      const provider = model.id.split("/")[0];
      if (!acc[provider]) acc[provider] = [];
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, OpenRouterModel[]>
  );
}

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  deepseek: "DeepSeek",
  "meta-llama": "Meta Llama",
  qwen: "Qwen",
  "x-ai": "xAI (Grok)",
  mistralai: "Mistral AI",
  moonshot: "Moonshot (Kimi)",
  cohere: "Cohere",
  perplexity: "Perplexity",
  nvidia: "NVIDIA",
};

export const PROVIDER_ICONS: Record<string, string> = {
  openai: "🤖",
  anthropic: "🔮",
  google: "🌐",
  deepseek: "🔍",
  "meta-llama": "🦙",
  qwen: "🌸",
  "x-ai": "✖️",
  mistralai: "💫",
  moonshot: "🌙",
};
