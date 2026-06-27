"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Image, Eye, FileText, Mic, Layout,
  BookOpen, Bot, Settings, Key, User, Crown, Plus, Search
} from "lucide-react";

const commands = [
  {
    category: "Navigasi",
    items: [
      { label: "AI Chat", href: "/chat", icon: MessageSquare, shortcut: "G C" },
      { label: "AI Image", href: "/image", icon: Image },
      { label: "AI Vision", href: "/vision", icon: Eye },
      { label: "AI Files", href: "/files", icon: FileText },
      { label: "AI Voice", href: "/voice", icon: Mic },
      { label: "AI Workspace", href: "/workspace", icon: Layout },
      { label: "Prompt Library", href: "/prompts", icon: BookOpen },
      { label: "AI Agents", href: "/agents", icon: Bot },
    ],
  },
  {
    category: "Akun",
    items: [
      { label: "Subscription", href: "/subscription", icon: Crown },
      { label: "API Settings", href: "/api-settings", icon: Key },
      { label: "Profil", href: "/profile", icon: User },
      { label: "Pengaturan", href: "/settings", icon: Settings },
    ],
  },
  {
    category: "Aksi",
    items: [
      { label: "Chat Baru", href: "/chat", icon: Plus },
    ],
  },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClose]);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-24 -translate-x-1/2 z-50 w-full max-w-xl"
          >
            <Command
              className="rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden"
              shouldFilter={true}
            >
              <div className="flex items-center gap-2 border-b border-border px-4">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <Command.Input
                  placeholder="Cari fitur, navigasi..."
                  className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="text-xs bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  Tidak ada hasil ditemukan
                </Command.Empty>

                {commands.map((group) => (
                  <Command.Group key={group.category} heading={group.category} className="mb-2">
                    {group.items.map((item) => (
                      <Command.Item
                        key={item.href + item.label}
                        value={item.label}
                        onSelect={() => handleSelect(item.href)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                      >
                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="flex-1">{item.label}</span>
                        {"shortcut" in item && item.shortcut && (
                          <div className="flex gap-1">
                            {(item.shortcut as string).split(" ").map((k) => (
                              <kbd key={k} className="text-xs bg-muted border border-border rounded px-1.5 py-0.5">
                                {k}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
