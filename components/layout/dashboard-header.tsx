"use client";

import { Bell, Search, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import Link from "next/link";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  onMobileMenuToggle: () => void;
  onCommandOpen: () => void;
}

export function DashboardHeader({
  user,
  onMobileMenuToggle,
  onCommandOpen,
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 border-b border-border flex items-center gap-3 px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden text-muted-foreground hover:text-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Command Palette Trigger */}
      <button
        onClick={onCommandOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted text-sm transition-colors flex-1 max-w-xs"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Cari...</span>
        <kbd className="ml-auto text-[10px] bg-background border border-border rounded px-1.5 py-0.5 hidden sm:block">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      {/* Actions */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-8 w-8"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      <Button variant="ghost" size="icon" asChild className="h-8 w-8 relative">
        <Link href="/notifications">
          <Bell className="w-4 h-4" />
        </Link>
      </Button>

      <Link href="/profile">
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src={user.image || ""} />
          <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
