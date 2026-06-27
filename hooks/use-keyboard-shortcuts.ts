"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { setCommandPaletteOpen, toggleSidebar } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Ctrl/Cmd + K → Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Skip if in input
      if (isInput) return;

      // B → Toggle sidebar
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // G + C → Go to Chat
      if (e.key === "c" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        router.push("/chat");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, setCommandPaletteOpen, toggleSidebar]);
}
