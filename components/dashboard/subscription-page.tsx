"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check, Crown, Zap, Clock, CreditCard, ExternalLink,
  MessageCircle, Copy, QrCode, AlertCircle, Loader2
} from "lucide-react";
import { formatCurrency, formatDate, PLAN_GRADIENTS } from "@/lib/utils";
import { toast } from "sonner";
import type { Plan, Subscription, Invoice } from "@/types";

interface SubscriptionPageProps {
  plans: Plan[];
  currentSubscription: (Subscription & { plan: Plan }) | null;
  recentInvoices: Invoice[];
}

export function SubscriptionPage({
  plans,
  currentSubscription,
  recentInvoices,
}: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30 * 60);

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.price === 0) return;
    setLoading(plan.id);

    try {
      const res = await fetch("/api/payments/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSelectedPlan(plan);
      setInvoice(data.data);
      setCountdown(30 * 60);

      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin ke clipboard");
  };

  const handleWhatsAppConfirm = () => {
    if (!invoice || !selectedPlan) return;
    const phone = process.env.NEXT_PUBLIC_WA_BOT_PHONE || "628123456789";
    const message = encodeURIComponent(
      `Halo, saya ingin melakukan verifikasi pembayaran.\n\nInvoice: ${invoice.invoiceNumber}\nNama: [Nama Lengkap Anda]\nEmail: [Email Anda]\nNominal: ${formatCurrency(selectedPlan.price)}\nPaket: ${selectedPlan.name}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Subscription</h1>
        <p className="text-muted-foreground">Kelola paket langganan Anda</p>
      </div>

      {/* Current Plan */}
      {currentSubscription && (
        <Card className="mb-8 border-nexus-500/30 bg-gradient-to-br from-nexus-500/5 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-nexus-400" />
                  <span className="font-bold text-lg">{currentSubscription.plan.name}</span>
                  <Badge variant="success">Aktif</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Aktif hingga: {currentSubscription.endDate
                    ? formatDate(currentSubscription.endDate)
                    : "Selamanya"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatCurrency(currentSubscription.plan.price)}</div>
                <div className="text-sm text-muted-foreground">/bulan</div>
              </div>
            </div>

            {/* Token Usage */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Token Digunakan</span>
                <span>{currentSubscription.tokensUsed.toLocaleString()} / {currentSubscription.tokensLimit.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-nexus-500 to-purple-600 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (currentSubscription.tokensUsed / currentSubscription.tokensLimit) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Modal */}
      <AnimatePresence>
        {invoice && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-500 to-purple-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Invoice Pembayaran</h3>
                  <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-sm text-amber-400">
                  Invoice kedaluwarsa dalam{" "}
                  <span className="font-bold font-mono">{formatCountdown(countdown)}</span>
                </span>
              </div>

              {/* Bank Info */}
              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-3">Transfer ke rekening berikut:</p>
                  <div className="space-y-2">
                    {[
                      { label: "Bank", value: invoice.bankName || "" },
                      { label: "No. Rekening", value: invoice.bankAccount || "", copy: true },
                      { label: "Atas Nama", value: invoice.bankOwner || "" },
                    ].map(({ label, value, copy }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{value}</span>
                          {copy && (
                            <button
                              onClick={() => handleCopyAccount(value)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="p-4 rounded-xl bg-nexus-500/10 border border-nexus-500/30 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total yang harus dibayar</p>
                  <p className="text-3xl font-bold text-nexus-400">
                    {formatCurrency(selectedPlan.price)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paket {selectedPlan.name} · {selectedPlan.period}
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-400">
                  Transfer nominal yang tertera dengan tepat. Konfirmasi via WhatsApp setelah transfer.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleWhatsAppConfirm}
                  className="w-full bg-green-500 hover:bg-green-600 text-white gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Saya Sudah Transfer - Konfirmasi via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setInvoice(null); setSelectedPlan(null); }}
                  className="w-full"
                >
                  Batal
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Grid */}
      <h2 className="text-lg font-semibold mb-4">Pilih Paket</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {plans.map((plan) => {
          const isCurrent = currentSubscription?.planId === plan.id;
          const features = plan.features as Record<string, boolean | string | number>;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`relative rounded-xl border p-5 transition-all ${
                isCurrent
                  ? "border-nexus-500/50 bg-nexus-500/5"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge variant="gradient" className="text-xs">Paket Anda</Badge>
                </div>
              )}

              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${PLAN_GRADIENTS[plan.type]} flex items-center justify-center mb-3`}>
                <Crown className="w-4 h-4 text-white" />
              </div>

              <h3 className="font-bold mb-0.5">{plan.name}</h3>
              <div className="mb-4">
                {plan.price === 0 ? (
                  <span className="text-xl font-bold">Gratis</span>
                ) : (
                  <>
                    <span className="text-xl font-bold">{formatCurrency(Number(plan.price))}</span>
                    <span className="text-muted-foreground text-xs">/{plan.period}</span>
                  </>
                )}
              </div>

              <ul className="space-y-1.5 mb-4">
                {Object.entries(features).slice(0, 4).map(([key, value]) => (
                  <li key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    {typeof value === "boolean" ? key : `${value} ${key}`}
                  </li>
                ))}
              </ul>

              <Button
                size="sm"
                className={`w-full ${
                  isCurrent
                    ? "bg-muted text-muted-foreground cursor-default"
                    : plan.type === "ENTERPRISE"
                    ? "bg-muted text-foreground hover:bg-muted/80"
                    : "bg-gradient-to-r from-nexus-500 to-purple-600 text-white"
                }`}
                disabled={isCurrent || loading === plan.id}
                onClick={() => !isCurrent && plan.price > 0 && handleSelectPlan(plan)}
              >
                {loading === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrent ? (
                  "Paket Aktif"
                ) : plan.type === "ENTERPRISE" ? (
                  "Hubungi Kami"
                ) : plan.price === 0 ? (
                  "Gratis"
                ) : (
                  "Pilih Paket"
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Invoices */}
      {recentInvoices.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Riwayat Invoice</h2>
          <Card>
            <div className="divide-y divide-border">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</p>
                  </div>
                  <div className="text-sm">{(inv as Invoice & { plan: Plan }).plan?.name}</div>
                  <div className="font-semibold">{formatCurrency(Number(inv.amount))}</div>
                  <Badge
                    variant={
                      inv.status === "PAID" ? "success" :
                      inv.status === "PENDING" ? "warning" :
                      inv.status === "EXPIRED" || inv.status === "REJECTED" ? "destructive" :
                      "secondary"
                    }
                  >
                    {inv.status === "PAID" ? "Dibayar" :
                     inv.status === "PENDING" ? "Menunggu" :
                     inv.status === "EXPIRED" ? "Kedaluwarsa" :
                     inv.status === "REJECTED" ? "Ditolak" : "Dibatalkan"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
