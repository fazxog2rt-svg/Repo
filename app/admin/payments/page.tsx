"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Eye, Clock, Search, Filter, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  user: { name: string; email: string };
  plan: { name: string; price: number };
  paymentProof?: {
    senderName: string;
    senderBank: string;
    amount: number;
    imageUrl?: string;
    createdAt: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  PAID: "bg-green-500/10 text-green-600 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  EXPIRED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-invoices", statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const invoices: Invoice[] = data?.data || [];
  const pagination = data?.pagination;

  const filtered = search
    ? invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
          inv.user.email.toLowerCase().includes(search.toLowerCase()) ||
          inv.user.name.toLowerCase().includes(search.toLowerCase())
      )
    : invoices;

  const actionMutation = useMutation({
    mutationFn: async ({ invoiceId, action, reason }: { invoiceId: string; action: string; reason?: string }) => {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, action, reason }),
      });
      if (!res.ok) throw new Error("Gagal memproses");
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      setSelectedInvoice(null);
      setActionType(null);
      setRejectReason("");
      toast.success(vars.action === "approve" ? "Pembayaran disetujui" : "Pembayaran ditolak");
    },
    onError: () => toast.error("Gagal memproses pembayaran"),
  });

  function handleAction(type: "approve" | "reject") {
    if (!selectedInvoice) return;
    if (type === "reject" && !rejectReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }
    actionMutation.mutate({
      invoiceId: selectedInvoice.id,
      action: type,
      reason: rejectReason || undefined,
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pembayaran</h1>
        <p className="text-muted-foreground text-sm mt-1">Verifikasi dan kelola bukti transfer pengguna</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari invoice, email, nama..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Dibayar</SelectItem>
            <SelectItem value="REJECTED">Ditolak</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium text-muted-foreground">Invoice</th>
                  <th className="p-4 font-medium text-muted-foreground">Pengguna</th>
                  <th className="p-4 font-medium text-muted-foreground">Paket</th>
                  <th className="p-4 font-medium text-muted-foreground">Jumlah</th>
                  <th className="p-4 font-medium text-muted-foreground">Status</th>
                  <th className="p-4 font-medium text-muted-foreground">Tanggal</th>
                  <th className="p-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={7} className="p-4">
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="p-4">
                        <p className="font-medium">{inv.user.name}</p>
                        <p className="text-xs text-muted-foreground">{inv.user.email}</p>
                      </td>
                      <td className="p-4">{inv.plan.name}</td>
                      <td className="p-4 font-medium">
                        Rp {inv.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[inv.status] || ""}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {pagination.total} total, halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(v: boolean) => !v && setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Invoice</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">No. Invoice</p>
                  <p className="font-mono font-medium">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[selectedInvoice.status] || ""}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">Pengguna</p>
                  <p className="font-medium">{selectedInvoice.user.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedInvoice.user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paket</p>
                  <p className="font-medium">{selectedInvoice.plan.name}</p>
                  <p className="text-xs text-muted-foreground">Rp {selectedInvoice.amount.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {selectedInvoice.paymentProof ? (
                <div className="border rounded-lg p-4 space-y-3">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Bukti Transfer Diterima
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Nama Pengirim</p>
                      <p className="font-medium">{selectedInvoice.paymentProof.senderName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Bank</p>
                      <p className="font-medium">{selectedInvoice.paymentProof.senderBank}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Jumlah Transfer</p>
                      <p className="font-medium">Rp {selectedInvoice.paymentProof.amount.toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Waktu Submit</p>
                      <p className="font-medium text-xs">{new Date(selectedInvoice.paymentProof.createdAt).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  {selectedInvoice.paymentProof.imageUrl && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-2">Foto Bukti Transfer</p>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                        <Image
                          src={selectedInvoice.paymentProof.imageUrl}
                          alt="Bukti Transfer"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <a
                        href={selectedInvoice.paymentProof.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Buka di tab baru
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg p-4 text-center text-muted-foreground text-sm">
                  <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  Belum ada bukti transfer
                </div>
              )}

              {/* Reject reason input */}
              {actionType === "reject" && (
                <div className="space-y-2">
                  <Label>Alasan Penolakan</Label>
                  <Textarea
                    placeholder="Jelaskan alasan penolakan pembayaran..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {selectedInvoice.status === "PENDING" && (
                <DialogFooter className="gap-2">
                  {actionType === null ? (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => setActionType("reject")}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Tolak
                      </Button>
                      <Button
                        onClick={() => handleAction("approve")}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={actionMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Setujui
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setActionType(null)}>Batal</Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleAction("reject")}
                        disabled={actionMutation.isPending || !rejectReason.trim()}
                      >
                        Konfirmasi Tolak
                      </Button>
                    </>
                  )}
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
