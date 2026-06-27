"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, Star, BookOpen, Filter } from "lucide-react";
import { toast } from "sonner";
import type { Prompt } from "@/types";

const CATEGORIES = ["Semua", "Coding", "Marketing", "Business", "Education", "Productivity", "Design", "Content", "SEO", "Research"];

export function PromptsPage({ prompts }: { prompts: Prompt[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filtered = prompts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Semua" || p.category === category;
    return matchSearch && matchCategory;
  });

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Prompt disalin!");
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-nexus-400" />
          Prompt Library
        </h1>
        <p className="text-muted-foreground">Koleksi prompt siap pakai untuk berbagai kebutuhan</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari prompt..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              category === cat
                ? "bg-nexus-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prompt, i) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="hover:border-border/80 transition-all group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-sm">{prompt.title}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">{prompt.category}</Badge>
                  </div>
                  <button
                    onClick={() => toggleFavorite(prompt.id)}
                    className={`text-muted-foreground hover:text-amber-400 transition-colors ${
                      favorites.has(prompt.id) ? "text-amber-400" : ""
                    }`}
                  >
                    <Star className={`w-4 h-4 ${favorites.has(prompt.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                {prompt.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{prompt.description}</p>
                )}

                <div className="bg-muted/50 rounded-lg p-2.5 mb-3">
                  <p className="text-xs text-muted-foreground line-clamp-3">{prompt.content}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(prompt.content)}
                    className="h-7 text-xs gap-1.5 flex-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Salin Prompt
                  </Button>
                  <span className="text-xs text-muted-foreground">{prompt.usageCount}x digunakan</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Tidak ada prompt ditemukan</p>
        </div>
      )}
    </div>
  );
}
