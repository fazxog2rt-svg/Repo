"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Send, Square, Paperclip, Mic, ImageIcon,
  Globe, X, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string, files?: File[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim() || isStreaming || disabled) return;
    onSend(value, files);
    setValue("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles].slice(0, 5));
  }, []);

  return (
    <div className="p-4 border-t border-border bg-background">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-sm"
            >
              <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground max-w-[120px] truncate">{file.name}</span>
              <span className="text-muted-foreground text-xs">{formatFileSize(file.size)}</span>
              <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <motion.div
        className={cn(
          "relative rounded-2xl border transition-all duration-200",
          isDragging
            ? "border-nexus-500 bg-nexus-500/5"
            : "border-input bg-muted/30 focus-within:border-nexus-500/50 focus-within:ring-1 focus-within:ring-nexus-500/20",
          disabled && "opacity-50"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Tambahkan API Key OpenRouter untuk mulai chat..." : "Ketik pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"}
          disabled={disabled || isStreaming}
          className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-4 pr-32 pl-4 text-sm"
          rows={1}
        />

        {/* Action buttons */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1">
          {/* Attach */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.mp3,.mp4"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Send / Stop */}
          {isStreaming ? (
            <Button
              type="button"
              size="icon-sm"
              onClick={onStop}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <Square className="w-4 h-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon-sm"
              onClick={handleSend}
              disabled={!value.trim() || disabled}
              className={cn(
                "transition-all",
                value.trim() && !disabled
                  ? "bg-gradient-to-r from-nexus-500 to-purple-600 text-white shadow-glow-sm"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Footer hint */}
      <p className="text-center text-xs text-muted-foreground/50 mt-2">
        NexusAI dapat membuat kesalahan. Verifikasi informasi penting.
      </p>
    </div>
  );
}
