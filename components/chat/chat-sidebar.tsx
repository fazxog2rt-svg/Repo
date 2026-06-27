"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, MessageSquare, Pin, Archive,
  MoreHorizontal, Trash2, Edit2, Share2, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import type { Chat } from "@/types";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((c) => c.isPinned);
  const recent = filtered.filter((c) => !c.isPinned && !c.isArchived);

  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          key="sidebar"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col border-r border-border bg-sidebar overflow-hidden h-full"
        >
          {/* Header */}
          <div className="p-3 border-b border-border flex items-center gap-2">
            <Button
              variant="gradient"
              size="sm"
              onClick={onNewChat}
              className="flex-1 gap-1.5 text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              Chat Baru
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen(false)}
              className="shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari chat..."
                className="h-7 pl-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Pinned */}
            {pinned.length > 0 && (
              <>
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                  Disematkan
                </p>
                {pinned.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onSelect={() => onSelectChat(chat.id)}
                  />
                ))}
                <div className="h-px bg-border my-2" />
              </>
            )}

            {/* Recent */}
            {recent.length > 0 ? (
              <>
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                  Terbaru
                </p>
                {recent.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onSelect={() => onSelectChat(chat.id)}
                  />
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Belum ada chat</p>
                <p className="text-xs text-muted-foreground/60">Mulai chat baru di atas</p>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="collapsed"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="flex flex-col items-center border-r border-border py-2 gap-2"
        >
          <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(true)}>
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onNewChat}>
            <Plus className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChatItem({
  chat,
  active,
  onSelect,
}: {
  chat: Chat;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ x: 2 }}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors group text-sm",
        active
          ? "bg-nexus-500/15 text-nexus-400"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {chat.isPinned && <Pin className="w-3 h-3 shrink-0 text-nexus-400" />}
      <span className="flex-1 truncate text-xs">{chat.title}</span>
      <span className="text-[10px] text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100">
        {formatRelativeTime(chat.updatedAt)}
      </span>
    </motion.button>
  );
}
