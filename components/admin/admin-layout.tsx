"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users, CreditCard, BarChart2, MessageSquare, Settings,
  Bell, FileText, LayoutDashboard, Zap, Shield, TrendingUp
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-56 border-r border-border bg-sidebar flex flex-col">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Admin Panel</p>
            <p className="text-[10px] text-muted-foreground">NexusAI</p>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {adminNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-amber-500/15 text-amber-500"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-border">
            <Link
              href="/chat"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Zap className="w-4 h-4" />
              Kembali ke App
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xs">
                {user.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
