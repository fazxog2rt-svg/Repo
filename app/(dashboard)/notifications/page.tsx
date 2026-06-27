"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, Info, CreditCard, Zap, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { Notification } from "@/types";

const TYPE_ICONS = {
  SYSTEM: Info,
  PAYMENT: CreditCard,
  SUBSCRIPTION: Zap,
  CHAT: MessageSquare,
  ADMIN: Shield,
};

const TYPE_COLORS = {
  SYSTEM: "text-blue-400 bg-blue-400/10",
  PAYMENT: "text-emerald-400 bg-emerald-400/10",
  SUBSCRIPTION: "text-nexus-400 bg-nexus-400/10",
  CHAT: "text-purple-400 bg-purple-400/10",
  ADMIN: "text-orange-400 bg-orange-400/10",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading } = useQuery<{ data: Notification[]; unreadCount: number }>({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/user/notifications").then((r) => r.json()),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (payload: { id?: string; readAll?: boolean }) =>
      fetch("/api/user/notifications", { method: "PATCH", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;
  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-nexus-500/10">
            <Bell className="w-5 h-5 text-nexus-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} belum dibaca</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markReadMutation.mutate({ readAll: true })}
            className="gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            filter === "all" ? "bg-nexus-500/15 text-nexus-400" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Semua ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            filter === "unread" ? "bg-nexus-500/15 text-nexus-400" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Belum dibaca ({unreadCount})
        </button>
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {filter === "unread" ? "Tidak ada notifikasi belum dibaca" : "Belum ada notifikasi"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif, i) => {
            const Icon = TYPE_ICONS[notif.type as keyof typeof TYPE_ICONS] || Info;
            const colorClass = TYPE_COLORS[notif.type as keyof typeof TYPE_COLORS] || TYPE_COLORS.SYSTEM;

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !notif.isRead && markReadMutation.mutate({ id: notif.id })}
                className={cn(
                  "flex gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                  notif.isRead
                    ? "border-border/50 bg-card/30 opacity-70"
                    : "border-nexus-500/20 bg-nexus-500/5 hover:bg-nexus-500/10"
                )}
              >
                <div className={cn("p-2 rounded-lg shrink-0 h-fit", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-nexus-500 shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: id })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markReadMutation.mutate({ id: notif.id });
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground shrink-0"
                    title="Tandai dibaca"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
