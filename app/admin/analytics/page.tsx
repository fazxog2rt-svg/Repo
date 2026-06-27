"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, MessageSquare, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  users: { total: number; newThisMonth: number };
  subscriptions: { active: number };
  payments: { pending: number; totalRevenue: number; revenueThisMonth: number };
  messages: { total: number; thisWeek: number };
  dailyUsage: Array<{ createdAt: string; _sum: { tokensUsed: number; cost: number } }>;
}

function StatCard({
  title,
  value,
  sub,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  trend?: "up" | "down";
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
                {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                {sub}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const stats: Stats | null = data?.data || null;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Statistik dan performa platform</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-7 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Statistik dan performa platform NexusAI</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Pengguna"
          value={stats?.users.total.toLocaleString("id-ID") || "0"}
          sub={`+${stats?.users.newThisMonth || 0} bulan ini`}
          trend="up"
          icon={Users}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Langganan Aktif"
          value={stats?.subscriptions.active.toLocaleString("id-ID") || "0"}
          icon={TrendingUp}
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          title="Total Pesan"
          value={stats?.messages.total.toLocaleString("id-ID") || "0"}
          sub={`${stats?.messages.thisWeek || 0} minggu ini`}
          trend="up"
          icon={MessageSquare}
          color="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={`Rp ${(stats?.payments.totalRevenue || 0).toLocaleString("id-ID")}`}
          sub={`Rp ${(stats?.payments.revenueThisMonth || 0).toLocaleString("id-ID")} bulan ini`}
          trend="up"
          icon={CreditCard}
          color="bg-amber-500/10 text-amber-500"
        />
      </div>

      {/* Pending Payments Alert */}
      {stats && stats.payments.pending > 0 && (
        <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <p className="text-sm font-medium">
              {stats.payments.pending} pembayaran menunggu verifikasi
            </p>
          </div>
          <a href="/admin/payments" className="text-xs text-primary hover:underline">
            Lihat semua →
          </a>
        </div>
      )}

      {/* Daily Usage Table */}
      {stats?.dailyUsage && stats.dailyUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Penggunaan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Tanggal</th>
                    <th className="pb-3 font-medium text-muted-foreground">Token Digunakan</th>
                    <th className="pb-3 font-medium text-muted-foreground">Estimasi Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyUsage.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3">
                        {new Date(row.createdAt).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="py-3 font-mono">
                        {(row._sum.tokensUsed || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 font-mono text-muted-foreground">
                        ${(row._sum.cost || 0).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-bold mt-1">
              {stats
                ? `${((stats.subscriptions.active / Math.max(stats.users.total, 1)) * 100).toFixed(1)}%`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Pengguna berbayar / total pengguna</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Avg Revenue Per User</p>
            <p className="text-2xl font-bold mt-1">
              {stats && stats.users.total > 0
                ? `Rp ${Math.round(stats.payments.totalRevenue / stats.users.total).toLocaleString("id-ID")}`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Revenue total / jumlah pengguna</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Avg Pesan / Pengguna</p>
            <p className="text-2xl font-bold mt-1">
              {stats && stats.users.total > 0
                ? Math.round(stats.messages.total / stats.users.total)
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total pesan / jumlah pengguna</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
