import { OpenRouterModel } from "@/types";
import { getCache, setCache } from "@/lib/redis";
import { decryptApiKey } from "@/lib/crypto";
export { groupModelsByProvider, PROVIDER_DISPLAY_NAMES, PROVIDER_ICONS } from "@/lib/ai/openrouter-utils";

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const MODELS_CACHE_KEY = "openrouter:models";
const MODELS_CACHE_TTL = 3600; // 1 hour

// ============================================================
// Models
// ============================================================

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  // Check cache first
  const cached = await getCache<OpenRouterModel[]>(MODELS_CACHE_KEY);
  if (cached) return cached;

  const systemKey = process.env.OPENROUTER_SYSTEM_KEY;
  if (!systemKey) {
    return getDefaultModels();
  }

  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${systemKey}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": process.env.APP_NAME || "NexusAI",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return getDefaultModels();

    const data = await res.json();
    const models: OpenRouterModel[] = data.data || [];

    await setCache(MODELS_CACHE_KEY, models, MODELS_CACHE_TTL);
    return models;
  } catch {
    return getDefaultModels();
  }
}

// ============================================================
// Chat Completion (Streaming)
// ============================================================

export async function createChatStream(params: {
  messages: Array<{ role: string; content: string }>;
  modelId: string;
  encryptedApiKey: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  systemPrompt?: string;
}): Promise<Response> {
  const apiKey = decryptApiKey(params.encryptedApiKey);

  const messages = params.systemPrompt
    ? [{ role: "system", content: params.systemPrompt }, ...params.messages]
    : params.messages;

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": process.env.APP_NAME || "NexusAI",
    },
    body: JSON.stringify({
      model: params.modelId,
      messages,
      stream: true,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 4096,
      top_p: params.topP ?? 1,
      presence_penalty: params.presencePenalty ?? 0,
      frequency_penalty: params.frequencyPenalty ?? 0,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `OpenRouter API error: ${response.status}`
    );
  }

  return response;
}

// ============================================================
// Non-streaming completion
// ============================================================

export async function createChatCompletion(params: {
  messages: Array<{ role: string; content: string }>;
  modelId: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}): Promise<{ content: string; tokens: number }> {
  const messages = params.systemPrompt
    ? [{ role: "system", content: params.systemPrompt }, ...params.messages]
    : params.messages;

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": process.env.APP_NAME || "NexusAI",
    },
    body: JSON.stringify({
      model: params.modelId,
      messages,
      stream: false,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 4096,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || `API Error: ${res.status}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || "",
    tokens: data.usage?.total_tokens || 0,
  };
}

// ============================================================
// Default models (when system key not available)
// ============================================================

function getDefaultModels(): OpenRouterModel[] {
  return [
    {
      id: "openai/gpt-4o",
      name: "GPT-4o",
      description: "OpenAI's most capable model",
      context_length: 128000,
      pricing: { prompt: "0.000005", completion: "0.000015" },
    },
    {
      id: "openai/gpt-4o-mini",
      name: "GPT-4o Mini",
      description: "Fast and affordable GPT-4o",
      context_length: 128000,
      pricing: { prompt: "0.00000015", completion: "0.0000006" },
    },
    {
      id: "openai/o3-mini",
      name: "o3-mini",
      description: "OpenAI reasoning model",
      context_length: 200000,
      pricing: { prompt: "0.0000011", completion: "0.0000044" },
    },
    {
      id: "anthropic/claude-sonnet-4-6",
      name: "Claude Sonnet 4.6",
      description: "Anthropic's latest Claude model",
      context_length: 200000,
      pricing: { prompt: "0.000003", completion: "0.000015" },
    },
    {
      id: "anthropic/claude-opus-4-8",
      name: "Claude Opus 4.8",
      description: "Most powerful Claude model",
      context_length: 200000,
      pricing: { prompt: "0.000015", completion: "0.000075" },
    },
    {
      id: "google/gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      description: "Google's fast multimodal model",
      context_length: 1000000,
      pricing: { prompt: "0.0000001", completion: "0.0000004" },
    },
    {
      id: "google/gemini-2.5-pro",
      name: "Gemini 2.5 Pro",
      description: "Google's most capable model",
      context_length: 2000000,
      pricing: { prompt: "0.00000125", completion: "0.00001" },
    },
    {
      id: "deepseek/deepseek-r1",
      name: "DeepSeek R1",
      description: "DeepSeek reasoning model",
      context_length: 128000,
      pricing: { prompt: "0.00000055", completion: "0.00000219" },
    },
    {
      id: "deepseek/deepseek-chat-v3-0324",
      name: "DeepSeek V3",
      description: "DeepSeek latest chat model",
      context_length: 128000,
      pricing: { prompt: "0.00000027", completion: "0.0000011" },
    },
    {
      id: "meta-llama/llama-3.3-70b-instruct",
      name: "Llama 3.3 70B",
      description: "Meta's Llama 3.3 70B model",
      context_length: 131072,
      pricing: { prompt: "0.00000012", completion: "0.0000003" },
    },
    {
      id: "qwen/qwen3-235b-a22b",
      name: "Qwen3 235B",
      description: "Alibaba's largest Qwen model",
      context_length: 40960,
      pricing: { prompt: "0.00000023", completion: "0.00000088" },
    },
    {
      id: "x-ai/grok-3",
      name: "Grok 3",
      description: "xAI's Grok 3 model",
      context_length: 131072,
      pricing: { prompt: "0.000003", completion: "0.000015" },
    },
    {
      id: "mistralai/mistral-large",
      name: "Mistral Large",
      description: "Mistral AI's large model",
      context_length: 131072,
      pricing: { prompt: "0.000002", completion: "0.000006" },
    },
    {
      id: "moonshot/moonshot-v1-8k",
      name: "Kimi (Moonshot)",
      description: "Moonshot AI's Kimi model",
      context_length: 8192,
      pricing: { prompt: "0.00000012", completion: "0.00000012" },
    },
  ];
}

