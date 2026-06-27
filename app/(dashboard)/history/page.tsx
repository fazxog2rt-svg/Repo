"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { History, Search, Trash2, MessageSquare, Pin, Archive, ExternalLink, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";

interface ChatItem {
  id: string;
  title: string;
  modelId: string;
  isPinned: boolean;
  isArchived: boolean;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const { data, isLoading } = useQuery<{ data: ChatItem[] }>({
    queryKey: ["chats", showArchived],
    queryFn: () => fetch(`/api/chat?archived=${showArchived}&limit=100`).then((r) => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (chatId: string) => fetch(`/api/chat/${chatId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Chat dihapus");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const chats = (data?.data || []).filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.modelId.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = chats.reduce<Record<string, ChatItem[]>>((acc, chat) => {
    const date = new Date(chat.updatedAt);
    const now = new Date();
    let key: string;
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) key = "Hari ini";
    else if (diffDays === 1) key = "Kemarin";
    else if (diffDays < 7) key = "7 hari terakhir";
    else if (diffDays < 30) key = "30 hari terakhir";
    else key = "Lebih lama";

    if (!acc[key]) acc[key] = [];
    acc[key].push(chat);
    return acc;
  }, {});

  const groupOrder = ["Hari ini", "Kemarin", "7 hari terakhir", "30 hari terakhir", "Lebih lama"];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-nexus-500/10">
          <History className="w-5 h-5 text-nexus-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Riwayat Chat</h1>
          <p className="text-sm text-muted-foreground">{chats.length} percakapan</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari percakapan..."
            className="pl-10"
          />
        </div>
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="gap-2"
        >
          <Archive className="w-4 h-4" />
          {showArchived ? "Arsip" : "Arsip"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search ? "Tidak ada percakapan yang cocok" : "Belum ada riwayat percakapan"}
          </p>
          {!search && (
            <Link href="/chat">
              <Button variant="outline" size="sm" className="mt-4">Mulai Chat Baru</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupOrder.filter((g) => grouped[g]).map((group) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-1">
                {group}
              </h3>
              <div className="space-y-1">
                {grouped[group].map((chat, i) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <Link href={`/chat?id=${chat.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                      <MessageSquare className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{chat.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Cpu className="w-3 h-3 text-muted-foreground/50" />
                          <span className="text-xs text-muted-foreground/60 truncate">{chat.modelId.split("/")[1] || chat.modelId}</span>
                          <span className="text-xs text-muted-foreground/40">•</span>
                          <span className="text-xs text-muted-foreground/60">{chat._count.messages} pesan</span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {chat.isPinned && <Pin className="w-3.5 h-3.5 text-nexus-400" />}
                      <Link href={`/chat?id=${chat.id}`}>
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteMutation.mutate(chat.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground/50 shrink-0">
                      {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true, locale: id })}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
