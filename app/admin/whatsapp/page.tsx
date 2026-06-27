"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { QrCode, Wifi, WifiOff, RefreshCw, Phone, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface WaStatus {
  connected: boolean;
  phone: string | null;
  lastSeen: string | null;
  qrCode: string | null;
}

export default function AdminWhatsAppPage() {
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["wa-status"],
    queryFn: async () => {
      const res = await fetch("/api/admin/whatsapp-status");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5s when not connected
  });

  const status: WaStatus = data?.data || { connected: false, phone: null, lastSeen: null, qrCode: null };

  useEffect(() => {
    if (status.qrCode) {
      // Convert QR data to image using qrcode library on client or show raw
      setQrImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(status.qrCode)}`);
    } else {
      setQrImageUrl(null);
    }
  }, [status.qrCode]);

  const setupSteps = [
    { step: 1, title: "Jalankan Bot Server", desc: "Jalankan perintah: npm run bot di terminal server" },
    { step: 2, title: "Tunggu QR Code", desc: "QR Code akan muncul di bawah setelah bot server aktif" },
    { step: 3, title: "Scan dengan WhatsApp", desc: "Buka WhatsApp > Perangkat Tertaut > Tautkan Perangkat" },
    { step: 4, title: "Bot Siap Digunakan", desc: "Bot akan aktif dan bisa memverifikasi pembayaran" },
  ];

  const features = [
    "Verifikasi bukti transfer otomatis",
    "Notifikasi status pembayaran ke pengguna",
    "Multi-step konfirmasi (nama, bank, foto bukti)",
    "Admin approval via WhatsApp",
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">WhatsApp Bot</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola koneksi bot WhatsApp untuk verifikasi pembayaran otomatis
        </p>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {status.connected ? (
                <><Wifi className="w-4 h-4 text-green-500" /> Terhubung</>
              ) : (
                <><WifiOff className="w-4 h-4 text-red-500" /> Tidak Terhubung</>
              )}
            </CardTitle>
            <CardDescription>Status koneksi bot WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`rounded-full w-16 h-16 mx-auto flex items-center justify-center ${status.connected ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {status.connected ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-500" />
              )}
            </div>

            {status.connected ? (
              <div className="space-y-2 text-sm">
                {status.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{status.phone}</span>
                  </div>
                )}
                {status.lastSeen && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Terakhir aktif: {new Date(status.lastSeen).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  Bot Aktif
                </Badge>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {status.qrCode ? "Scan QR code untuk menghubungkan" : "Menunggu bot server..."}
                </p>
                <Badge variant="outline" className="text-red-500 border-red-500/20">
                  Offline
                </Badge>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="w-4 h-4" />
              QR Code
            </CardTitle>
            <CardDescription>Scan untuk menghubungkan WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-48">
            {status.connected ? (
              <div className="text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="text-sm">WhatsApp sudah terhubung</p>
                <p className="text-xs mt-1">QR Code tidak diperlukan</p>
              </div>
            ) : isLoading ? (
              <div className="w-48 h-48 bg-muted rounded-lg animate-pulse" />
            ) : qrImageUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="relative w-56 h-56 mx-auto border-2 border-primary/20 rounded-xl overflow-hidden p-2 bg-white">
                  <Image src={qrImageUrl} alt="WhatsApp QR Code" fill className="object-contain" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  QR Code akan expired dalam 60 detik
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Diperbarui: {new Date(dataUpdatedAt).toLocaleTimeString("id-ID")}
                </p>
              </motion.div>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">QR Code belum tersedia</p>
                <p className="text-xs mt-1">Jalankan bot server terlebih dahulu</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cara Setup Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {setupSteps.map((step) => (
              <div key={step.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {step.step}
                </div>
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Perintah untuk menjalankan bot:</p>
            <code className="text-xs font-mono bg-background border rounded px-3 py-2 block">
              NODE_ENV=production npx ts-node server/whatsapp/bot.ts
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fitur Bot WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Environment Variables yang Diperlukan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-xs">
            {[
              { key: "WA_ADMIN_PHONE", desc: "Nomor WhatsApp admin utama (format: 628xxx)" },
              { key: "WA_ADMIN_PHONE2", desc: "Nomor admin cadangan (opsional)" },
              { key: "WA_SESSION_PATH", desc: "Path folder session Baileys (default: ./wa-session)" },
              { key: "NEXTAUTH_SECRET", desc: "Secret key untuk internal API calls" },
              { key: "NEXTAUTH_URL", desc: "URL aplikasi (untuk callback WhatsApp)" },
            ].map(({ key, desc }) => (
              <div key={key} className="flex gap-3 p-2 bg-muted/50 rounded">
                <span className="text-primary font-bold min-w-fit">{key}</span>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
