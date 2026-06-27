"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CreditCard, Receipt, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu Pembayaran", icon: Clock, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  PAID: { label: "Lunas", icon: CheckCircle, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  EXPIRED: { label: "Kedaluwarsa", icon: XCircle, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  REJECTED: { label: "Ditolak", icon: XCircle, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  CANCELLED: { label: "Dibatalkan", icon: XCircle, color: "text-muted-foreground bg-muted/50 border-border" },
};

function formatCurrency(amount: number, currency = "IDR"): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);
}

export default function BillingPage() {
  const { data: subData, isLoading: subLoading } = useQuery<{ data: any }>({
    queryKey: ["subscription"],
    queryFn: () => fetch("/api/subscription").then((r) => r.json()),
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery<{ data: any[] }>({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/payments/invoices").then((r) => r.json()),
  });

  const subscription = subData?.data?.subscription;
  const monthlyTokensUsed = subData?.data?.monthlyTokensUsed || 0;
  const invoices = invoicesData?.data || [];

  const tokenUsagePercent = subscription
    ? Math.min(100, (monthlyTokensUsed / (subscription.tokensLimit || 1)) * 100)
    : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-emerald-500/10">
          <CreditCard className="w-5 h-5 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold">Billing & Pembayaran</h1>
      </div>

      <div className="space-y-6">
        {/* Current plan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Paket Aktif</h3>

          {subLoading ? (
            <div className="h-20 bg-muted animate-pulse rounded-xl" />
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-bold">{subscription.plan?.name || "Free Plan"}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {subscription.endDate
                      ? `Aktif hingga ${format(new Date(subscription.endDate), "d MMMM yyyy", { locale: idLocale })}`
                      : "Aktif"}
                  </p>
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                  {subscription.status}
                </Badge>
              </div>

              {/* Token usage bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Penggunaan Token Bulan Ini</span>
                  <span>{monthlyTokensUsed.toLocaleString()} / {subscription.tokensLimit?.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      tokenUsagePercent > 90 ? "bg-red-500" : tokenUsagePercent > 70 ? "bg-yellow-500" : "bg-nexus-500"
                    )}
                    style={{ width: `${tokenUsagePercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{tokenUsagePercent.toFixed(1)}% terpakai</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Tidak ada paket aktif</p>
              <Link href="/subscription">
                <Button size="sm" className="gap-1.5">
                  Upgrade <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <Link href="/subscription">
              <Button variant="outline" size="sm" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Kelola Langganan
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Invoice history */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Riwayat Invoice</h3>

          {invoicesLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10">
              <Receipt className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada riwayat pembayaran</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice: any) => {
                const statusConfig = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                const Icon = statusConfig.icon;

                return (
                  <div
                    key={invoice.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-border transition-colors"
                  >
                    <div className={cn("p-2 rounded-lg shrink-0", statusConfig.color.split(" ").slice(1).join(" "))}>
                      <Icon className={cn("w-4 h-4", statusConfig.color.split(" ")[0])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {invoice.plan?.name} • {format(new Date(invoice.createdAt), "d MMM yyyy", { locale: idLocale })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(invoice.amount, invoice.currency)}</p>
                      <span className={cn("text-xs font-medium", statusConfig.color.split(" ")[0])}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
