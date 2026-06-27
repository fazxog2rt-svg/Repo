"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, CreditCard, TrendingUp, Clock, Check, X,
  AlertCircle, Eye, Loader2
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Invoice, User, Plan } from "@/types";

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    pendingPayments: number;
    totalRevenue: number;
  };
  recentInvoices: Array<
    Invoice & {
      user: { name: string | null; email: string };
      plan: { name: string };
    }
  >;
}

export function AdminDashboard({ stats, recentInvoices: initialInvoices }: AdminDashboardProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const statCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Users Aktif", value: stats.activeUsers.toLocaleString(), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Pending Payments", value: stats.pendingPayments, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: CreditCard, color: "text-nexus-400", bg: "bg-nexus-500/10" },
  ];

  const handleApprove = async (invoiceId: string) => {
    setProcessing(invoiceId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Pembayaran disetujui! Subscription user aktif.");
      setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessing(rejectModal.id);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: rejectModal.id,
          action: "reject",
          reason: rejectReason || "Bukti transfer tidak valid",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Pembayaran ditolak");
      setInvoices((prev) => prev.filter((i) => i.id !== rejectModal.id));
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Kelola platform NexusAI</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-lg font-bold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Pembayaran Menunggu Verifikasi ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Check className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p>Tidak ada pembayaran yang perlu diverifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                      <Badge variant="warning" className="text-xs">Menunggu</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.user.name || invoice.user.email} · Paket {invoice.plan.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(invoice.createdAt)}
                    </p>
                    {invoice.paymentProof && (
                      <div className="mt-2 p-2 rounded-lg bg-muted/50 text-xs">
                        <p>Pengirim: {invoice.paymentProof.senderName}</p>
                        <p>Bank: {invoice.paymentProof.senderBank}</p>
                        <p>Nominal: {formatCurrency(Number(invoice.paymentProof.amount))}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <p className="font-bold text-sm">{formatCurrency(Number(invoice.amount))}</p>
                    {invoice.paymentProof?.imageUrl && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        className="text-blue-400"
                      >
                        <a href={invoice.paymentProof.imageUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleApprove(invoice.id)}
                      disabled={processing === invoice.id}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 h-8"
                    >
                      {processing === invoice.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectModal({ id: invoice.id })}
                      disabled={processing === invoice.id}
                      className="gap-1.5 h-8 text-destructive border-destructive/30"
                    >
                      <X className="w-3 h-3" />
                      Tolak
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold mb-4">Tolak Pembayaran</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="w-full h-24 p-3 rounded-lg border border-border bg-muted/50 text-sm resize-none mb-4 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                disabled={!!processing}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tolak"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
