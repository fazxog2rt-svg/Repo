import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid"),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password terlalu panjang"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

export const chatSchema = z.object({
  content: z.string().min(1).max(32000),
  modelId: z.string(),
  chatId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(100000).optional(),
});

export const agentSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(1).max(10000),
  modelId: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(100000).default(4096),
  topP: z.number().min(0).max(1).default(1),
  presencePenalty: z.number().min(-2).max(2).default(0),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
});

export const promptSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(10).max(10000),
  category: z.string(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).max(10).optional(),
  isPublic: z.boolean().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
export type AgentInput = z.infer<typeof agentSchema>;
export type PromptInput = z.infer<typeof promptSchema>;
