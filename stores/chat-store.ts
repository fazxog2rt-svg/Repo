import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chat, Message } from "@/types";

interface ChatStore {
  activeChatId: string | null;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  sidebarOpen: boolean;

  setActiveChatId: (id: string | null) => void;
  setSelectedModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      activeChatId: null,
      selectedModel: "openai/gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4096,
      sidebarOpen: true,

      setActiveChatId: (id) => set({ activeChatId: id }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setTemperature: (temp) => set({ temperature: temp }),
      setMaxTokens: (tokens) => set({ maxTokens: tokens }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "nexusai-chat",
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
