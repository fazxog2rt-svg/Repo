"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare, Image, Eye, FileText, Mic, Layout, BookOpen, Bot,
  History, Star, FolderOpen, CreditCard, Bell, Key, Settings,
  ChevronLeft, ChevronRight, Zap, User, Crown, BarChart2, Plus,
  LogOut, Shield
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isNew?: boolean;
}

const mainNav: NavItem[] = [
  { label: "AI Chat", href: "/chat", icon: MessageSquare },
  { label: "AI Image", href: "/image", icon: Image, isNew: true },
  { label: "AI Vision", href: "/vision", icon: Eye },
  { label: "AI Files", href: "/files", icon: FileText },
  { label: "AI Voice", href: "/voice", icon: Mic },
  { label: "AI Workspace", href: "/workspace", icon: Layout, isNew: true },
];

const libraryNav: NavItem[] = [
  { label: "Prompt Library", href: "/prompts", icon: BookOpen },
  { label: "AI Agents", href: "/agents", icon: Bot },
  { label: "Riwayat", href: "/history", icon: History },
  { label: "Favorit", href: "/favorites", icon: Star },
  { label: "Dokumen", href: "/documents", icon: FolderOpen },
];

const accountNav: NavItem[] = [
  { label: "Subscription", href: "/subscription", icon: Crown },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Notifikasi", href: "/notifications", icon: Bell },
  { label: "API Settings", href: "/api-settings", icon: Key },
  { label: "Profil", href: "/profile", icon: User },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

function NavItemComponent({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative",
        active
          ? "bg-nexus-500/15 text-nexus-400"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon
        className={cn(
          "w-4 h-4 shrink-0",
          active ? "text-nexus-400" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && item.isNew && (
        <Badge variant="gradient" className="text-[10px] px-1.5 py-0">
          New
        </Badge>
      )}
      {!collapsed && item.badge && (
        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
          {item.badge}
        </span>
      )}

      {/* Active indicator */}
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-nexus-400"
        />
      )}
    </Link>
  );
}

function NavSection({
  title,
  items,
  collapsed,
  pathname,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItemComponent
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn("flex items-center h-14 px-3 border-b border-border", collapsed ? "justify-center" : "gap-2")}>
        <Link href="/chat" className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-500 to-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-foreground truncate"
              >
                Nexus<span className="text-nexus-400">AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className={cn("p-2", collapsed ? "px-2" : "")}>
        <Link
          href="/chat"
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-nexus-500/20 to-purple-500/10 border border-nexus-500/20 text-nexus-400 hover:from-nexus-500/30 hover:to-purple-500/20 transition-all text-sm font-medium",
            collapsed && "justify-center px-2"
          )}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Chat Baru</span>}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin">
        <NavSection title="AI Tools" items={mainNav} collapsed={collapsed} pathname={pathname} />
        <Separator className="my-1" />
        <NavSection title="Library" items={libraryNav} collapsed={collapsed} pathname={pathname} />
        <Separator className="my-1" />
        <NavSection title="Akun" items={accountNav} collapsed={collapsed} pathname={pathname} />

        {isAdmin && (
          <>
            <Separator className="my-1" />
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                Admin
              </p>
            )}
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-amber-500 hover:bg-amber-500/10",
                collapsed && "justify-center px-2"
              )}
            >
              <Shield className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          </>
        )}
      </div>

      {/* User Profile */}
      <div className="border-t border-border p-2">
        <div className={cn("flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors", collapsed && "justify-center")}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted-foreground hover:text-destructive p-1 rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="border-t border-border p-3 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-border bg-sidebar overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed left-0 top-0 bottom-0 z-40 w-64 border-r border-border bg-sidebar flex flex-col"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
