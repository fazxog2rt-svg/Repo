"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ModelSelector } from "./model-selector";
import { NoApiKeyBanner } from "./no-api-key-banner";
import { toast } from "sonner";
import type { Chat, Message, OpenRouterModel } from "@/types";

interface ChatInterfaceProps {
  userId: string;
  hasApiKey: boolean;
}

export function ChatInterface({ userId, hasApiKey }: ChatInterfaceProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  // Fetch chats
  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: () => fetch("/api/chat").then((r) => r.json()).then((d) => d.data || []),
  });

  // Fetch messages for active chat
  const { data: chatMessages = [] } = useQuery<Message[]>({
    queryKey: ["messages", activeChatId],
    queryFn: () =>
      fetch(`/api/chat/${activeChatId}/messages`).then((r) => r.json()).then((d) => d.data || []),
    enabled: !!activeChatId,
  });

  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages]);

  // Create new chat
  const createChat = useMutation({
    mutationFn: async (data: { title: string; modelId: string }) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setActiveChatId(data.data?.id);
    },
  });

  const handleSend = useCallback(
    async (content: string, files?: File[]) => {
      if (!content.trim() || isStreaming) return;
      if (!hasApiKey) {
        toast.error("Tambahkan API Key OpenRouter di Settings terlebih dahulu");
        return;
      }

      let chatId = activeChatId;

      // Create chat if not exists
      if (!chatId) {
        const res = await createChat.mutateAsync({
          title: content.slice(0, 50),
          modelId: selectedModel,
        });
        chatId = res.data?.id;
        if (!chatId) return;
      }

      // Add user message to UI
      const userMsg: Message = {
        id: Date.now().toString(),
        chatId,
        role: "USER",
        content,
        isEdited: false,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingContent("");

      try {
        abortControllerRef.current = new AbortController();

        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            content,
            modelId: selectedModel,
            temperature,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal mengirim pesan");
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const json = JSON.parse(data);
                  const delta = json.choices?.[0]?.delta?.content || "";
                  fullContent += delta;
                  setStreamingContent(fullContent);
                } catch {
                  /* skip invalid JSON */
                }
              }
            }
          }
        }

        // Add final assistant message
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          chatId,
          role: "ASSISTANT",
          content: fullContent,
          modelId: selectedModel,
          isEdited: false,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error((err as Error).message || "Terjadi kesalahan");
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [activeChatId, createChat, hasApiKey, isStreaming, queryClient, selectedModel, temperature]
  );

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat List Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setMessages([]);
        }}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Toolbar */}
        <div className="h-12 border-b border-border flex items-center gap-3 px-4 bg-background/80 backdrop-blur-sm">
          <ModelSelector
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
          />
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            Temp: {temperature}
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-20 h-1 accent-nexus-500"
            />
          </div>
        </div>

        {!hasApiKey && <NoApiKeyBanner />}

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            selectedModel={selectedModel}
          />
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
          disabled={!hasApiKey}
        />
      </div>
    </div>
  );
}
