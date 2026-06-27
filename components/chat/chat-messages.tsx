"use client";

import { useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw, Pencil, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getModelProvider } from "@/lib/utils";
import type { Message } from "@/types";
import "katex/dist/katex.min.css";

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  selectedModel: string;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const MessageContent = memo(({ content }: { content: string }) => (
  <div className="chat-prose">
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
      components={{
        pre: ({ children, ...props }) => {
          const textContent = typeof children === "string" ? children : "";
          return (
            <div className="relative group">
              <pre {...props} className="overflow-x-auto rounded-xl bg-zinc-900 border border-zinc-700/50 p-4 text-sm">
                {children}
              </pre>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={textContent} />
              </div>
            </div>
          );
        },
        code: ({ className, children, ...props }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) return <code className={className} {...props}>{children}</code>;
          return (
            <code
              className="bg-zinc-800/70 text-zinc-200 px-1.5 py-0.5 rounded text-[0.875em]"
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
));
MessageContent.displayName = "MessageContent";

const TypingIndicator = () => (
  <div className="flex gap-1 px-1 py-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-muted-foreground/40 rounded-full"
        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

export function ChatMessages({
  messages,
  isStreaming,
  streamingContent,
  selectedModel,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nexus-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Halo! Saya NexusAI</h2>
          <p className="text-muted-foreground mb-6">
            Tanyakan apa saja. Saya siap membantu dengan coding, analisis, penulisan, dan lebih banyak lagi.
          </p>
          <div className="grid grid-cols-2 gap-2 text-left">
            {[
              "Jelaskan konsep machine learning",
              "Tulis fungsi sorting di Python",
              "Buat outline artikel blog SEO",
              "Terjemahkan ke bahasa Inggris",
            ].map((suggestion) => (
              <button
                key={suggestion}
                className="p-3 rounded-xl border border-border bg-card hover:bg-muted text-sm text-left transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 group",
                message.role === "USER" && "flex-row-reverse"
              )}
            >
              {/* Avatar */}
              <Avatar className={cn("w-8 h-8 shrink-0 mt-0.5", message.role === "USER" && "order-last")}>
                {message.role === "USER" ? (
                  <AvatarFallback className="bg-nexus-500/20 text-nexus-400 text-xs">U</AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-nexus-500 to-purple-600 text-white text-xs">
                    AI
                  </AvatarFallback>
                )}
              </Avatar>

              {/* Content */}
              <div className={cn("flex-1 min-w-0", message.role === "USER" && "flex flex-col items-end")}>
                {/* Role label */}
                <div className={cn("flex items-center gap-2 mb-1", message.role === "USER" && "flex-row-reverse")}>
                  <span className="text-xs font-medium text-muted-foreground">
                    {message.role === "USER" ? "Anda" : message.modelId || selectedModel}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {new Date(message.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Message bubble */}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 max-w-[85%]",
                    message.role === "USER"
                      ? "bg-nexus-500/15 border border-nexus-500/20 text-foreground"
                      : "bg-muted/50 border border-border text-foreground"
                  )}
                >
                  {message.role === "USER" ? (
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  ) : (
                    <MessageContent content={message.content} />
                  )}
                </div>

                {/* Actions */}
                <div
                  className={cn(
                    "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    message.role === "USER" && "flex-row-reverse"
                  )}
                >
                  <CopyButton text={message.content} />
                  {message.role === "ASSISTANT" && (
                    <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Streaming message */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                <AvatarFallback className="bg-gradient-to-br from-nexus-500 to-purple-600 text-white text-xs">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{selectedModel}</span>
                </div>
                <div className="rounded-2xl px-4 py-3 bg-muted/50 border border-border max-w-[85%]">
                  {streamingContent ? (
                    <MessageContent content={streamingContent} />
                  ) : (
                    <TypingIndicator />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
