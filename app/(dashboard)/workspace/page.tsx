"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Plus, Kanban, Calendar, ListTodo, FileText, Wand2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewType = "board" | "list" | "document";

const SAMPLE_COLUMNS = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-slate-500",
    cards: [
      { id: "1", title: "Riset kompetitor AI platform", priority: "high" },
      { id: "2", title: "Buat desain UI landing page", priority: "medium" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-blue-500",
    cards: [
      { id: "3", title: "Implementasi fitur streaming chat", priority: "high" },
      { id: "4", title: "Integrasi OpenRouter API", priority: "high" },
    ],
  },
  {
    id: "review",
    title: "Review",
    color: "bg-yellow-500",
    cards: [
      { id: "5", title: "Testing autentikasi OAuth", priority: "medium" },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-emerald-500",
    cards: [
      { id: "6", title: "Setup database schema", priority: "low" },
      { id: "7", title: "Konfigurasi Prisma ORM", priority: "low" },
    ],
  },
];

const PRIORITY_COLORS = {
  high: "text-red-400 bg-red-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  low: "text-green-400 bg-green-400/10",
};

export default function WorkspacePage() {
  const [view, setView] = useState<ViewType>("board");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [docContent, setDocContent] = useState(`# Workspace Saya

Ini adalah workspace kolaboratif Anda. Gunakan AI assistant untuk membantu:
- Membuat task dan rencana kerja
- Menganalisis data dan dokumen
- Brainstorming ide-ide baru

## Cara Penggunaan
1. Pilih tampilan di atas (Board/List/Dokumen)
2. Gunakan AI Assistant di bawah untuk bantuan
3. Kelola tugas dengan drag & drop (Board view)

## Catatan
> Fitur workspace terus dikembangkan dengan kemampuan real-time collaboration
`);

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: aiPrompt }],
          modelId: "openai/gpt-4o-mini",
          chatId: "workspace",
        }),
      });
      const data = await res.json();
      if (data.content) {
        setDocContent((prev) => prev + "\n\n## AI Response\n" + data.content);
        setAiPrompt("");
      }
    } catch {
      toast.error("Gagal menghubungi AI");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-purple-500/10">
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h1 className="font-bold">AI Workspace</h1>
            <p className="text-xs text-muted-foreground">Kelola proyek dengan bantuan AI</p>
          </div>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {[
            { id: "board" as const, icon: Kanban, label: "Board" },
            { id: "list" as const, icon: ListTodo, label: "List" },
            { id: "document" as const, icon: FileText, label: "Dokumen" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                view === id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {/* Board view */}
          {view === "board" && (
            <div className="p-6 flex gap-4 min-w-max">
              {SAMPLE_COLUMNS.map((col) => (
                <div key={col.id} className="w-64 shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("w-2 h-2 rounded-full", col.color)} />
                    <h3 className="text-sm font-semibold">{col.title}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">{col.cards.length}</span>
                  </div>
                  <div className="space-y-2">
                    {col.cards.map((card) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-xl border border-border bg-card hover:border-nexus-500/30 cursor-pointer transition-all group"
                      >
                        <p className="text-sm font-medium">{card.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize", PRIORITY_COLORS[card.priority as keyof typeof PRIORITY_COLORS])}>
                            {card.priority}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    <button className="w-full p-2 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:border-nexus-500/50 hover:text-nexus-400 transition-all flex items-center justify-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Card
                    </button>
                  </div>
                </div>
              ))}

              {/* Add column */}
              <button className="w-48 h-fit p-4 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-nexus-500/50 hover:text-nexus-400 transition-all flex items-center justify-center gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                Kolom Baru
              </button>
            </div>
          )}

          {/* List view */}
          {view === "list" && (
            <div className="p-6 max-w-2xl space-y-2">
              {SAMPLE_COLUMNS.flatMap((col) =>
                col.cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-nexus-500/20 bg-card transition-all group"
                  >
                    <input type="checkbox" className="rounded" />
                    <span className="flex-1 text-sm">{card.title}</span>
                    <div className={cn("w-2 h-2 rounded-full", SAMPLE_COLUMNS.find((c) => c.cards.includes(card))?.color)} />
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize", PRIORITY_COLORS[card.priority as keyof typeof PRIORITY_COLORS])}>
                      {card.priority}
                    </span>
                  </div>
                ))
              )}
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-3 w-full">
                <Plus className="w-4 h-4" />
                Tambah Task
              </button>
            </div>
          )}

          {/* Document view */}
          {view === "document" && (
            <div className="p-6 max-w-3xl mx-auto">
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="w-full min-h-[60vh] bg-transparent text-sm leading-relaxed font-mono outline-none resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant panel */}
      <div className="border-t border-border p-4 bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-nexus-500/10">
            <Sparkles className="w-4 h-4 text-nexus-400" />
          </div>
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAiAssist()}
            placeholder="Tanya AI untuk membantu workspace Anda... (Enter untuk kirim)"
            className="flex-1 border-0 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button onClick={handleAiAssist} disabled={aiLoading || !aiPrompt.trim()} size="sm" className="gap-1.5">
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            Tanya AI
          </Button>
        </div>
      </div>
    </div>
  );
}
