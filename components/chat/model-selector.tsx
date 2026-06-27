"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROVIDER_DISPLAY_NAMES, PROVIDER_ICONS, groupModelsByProvider } from "@/lib/ai/openrouter-utils";
import type { OpenRouterModel } from "@/types";

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
}

export function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: models = [] } = useQuery<OpenRouterModel[]>({
    queryKey: ["models"],
    queryFn: () => fetch("/api/models").then((r) => r.json()).then((d) => d.data || []),
    staleTime: 3600 * 1000,
  });

  const grouped = groupModelsByProvider(
    models.filter(
      (m) =>
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase())
    )
  );

  const currentModel = models.find((m) => m.id === selectedModel);
  const modelName = currentModel?.name || selectedModel.split("/")[1] || selectedModel;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2 h-8 text-sm max-w-[200px]"
      >
        <Cpu className="w-3.5 h-3.5 text-nexus-400 shrink-0" />
        <span className="truncate">{modelName}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full left-0 mt-1 z-20 w-80 max-h-96 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
            >
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari model..."
                    className="h-8 pl-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
                    autoFocus
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-80 p-2 space-y-3">
                {Object.entries(grouped).map(([provider, providerModels]) => (
                  <div key={provider}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-2 mb-1">
                      {PROVIDER_ICONS[provider] || "🤖"} {PROVIDER_DISPLAY_NAMES[provider] || provider}
                    </p>
                    <div className="space-y-0.5">
                      {providerModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            onSelect(model.id);
                            setOpen(false);
                            setSearch("");
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors",
                            selectedModel === model.id
                              ? "bg-nexus-500/15 text-nexus-400"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <span className="flex-1 truncate font-medium">{model.name}</span>
                          {model.context_length && (
                            <span className="text-muted-foreground/50 text-[10px] shrink-0">
                              {(model.context_length / 1000).toFixed(0)}K
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(grouped).length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Tidak ada model ditemukan
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
