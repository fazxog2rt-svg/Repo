"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, MessageSquare, BookOpen, Search, ExternalLink, Trash2, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

type TabType = "chats" | "prompts";

export default function FavoritesPage() {
  const [tab, setTab] = useState<TabType>("chats");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: chatsData } = useQuery<{ data: any[] }>({
    queryKey: ["chats-pinned"],
    queryFn: () => fetch("/api/chat?limit=100").then((r) => r.json()),
  });

  const { data: promptsData } = useQuery<{ data: any[] }>({
    queryKey: ["prompts-favorited"],
    queryFn: () => fetch("/api/prompts").then((r) => r.json()),
  });

  const pinnedChats = (chatsData?.data || []).filter(
    (c) => c.isPinned && c.title.toLowerCase().includes(search.toLowerCase())
  );

  const favPrompts = (promptsData?.data || []).filter(
    (p) => p.isFavorited && (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const items = tab === "chats" ? pinnedChats : favPrompts;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-pink-500/10">
          <Heart className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Favorit</h1>
          <p className="text-sm text-muted-foreground">Chat yang di-pin dan prompt favorit Anda</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: "chats" as const, label: "Chat Terpin", icon: MessageSquare, count: pinnedChats.length },
          { id: "prompts" as const, label: "Prompt Favorit", icon: BookOpen, count: favPrompts.length },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              tab === id
                ? "bg-nexus-500/15 text-nexus-400 border border-nexus-500/30"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className="text-xs opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Cari ${tab === "chats" ? "chat" : "prompt"}...`}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search
              ? "Tidak ada yang cocok"
              : tab === "chats"
              ? "Belum ada chat yang di-pin. Pin chat dari halaman riwayat."
              : "Belum ada prompt favorit."}
          </p>
          {!search && (
            <Link href={tab === "chats" ? "/history" : "/prompts"}>
              <Button variant="outline" size="sm" className="mt-4">
                {tab === "chats" ? "Lihat Riwayat Chat" : "Jelajahi Prompt"}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-border bg-card/50 hover:bg-card transition-all"
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                tab === "chats" ? "bg-nexus-500/10 text-nexus-400" : "bg-purple-500/10 text-purple-400"
              )}>
                {tab === "chats" ? <MessageSquare className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {tab === "chats" ? (
                    <>
                      <Cpu className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground/60">{item.modelId?.split("/")[1] || item.modelId}</span>
                      <span className="text-xs text-muted-foreground/40">•</span>
                      <span className="text-xs text-muted-foreground/60">{item._count?.messages} pesan</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground/60">{item.description || item.category}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={tab === "chats" ? `/chat?id=${item.id}` : `/prompts`}>
                  <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <span className="text-xs text-muted-foreground/50 shrink-0">
                {formatDistanceToNow(new Date(item.updatedAt || item.createdAt), { addSuffix: true, locale: id })}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
