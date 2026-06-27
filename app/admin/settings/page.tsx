"use client";

import { useState } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [freeTokens, setFreeTokens] = useState("50000");
  const [adminEmail, setAdminEmail] = useState("");

  function handleSave() {
    toast.success("Pengaturan berhasil disimpan");
  }

  const settings = [
    {
      title: "Mode Maintenance",
      desc: "Nonaktifkan akses pengguna sementara untuk maintenance",
      value: maintenanceMode,
      onChange: setMaintenanceMode,
      danger: true,
    },
    {
      title: "Registrasi Terbuka",
      desc: "Izinkan pengguna baru mendaftar",
      value: registrationOpen,
      onChange: setRegistrationOpen,
      danger: false,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Platform</h1>
        <p className="text-muted-foreground text-sm mt-1">Konfigurasi global platform NexusAI</p>
      </div>

      {/* Toggle Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kontrol Akses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((s) => (
            <div key={s.title} className={`flex items-center justify-between p-3 rounded-lg border ${s.danger && s.value ? "border-red-500/30 bg-red-500/5" : ""}`}>
              <div>
                <div className="flex items-center gap-2">
                  {s.danger && s.value && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <p className="text-sm font-medium">{s.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
              <Switch checked={s.value} onCheckedChange={s.onChange} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Token Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kuota Token Free</CardTitle>
          <CardDescription>Token yang diberikan ke pengguna baru (plan Free)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Token per Bulan</Label>
            <Input
              type="number"
              value={freeTokens}
              onChange={(e) => setFreeTokens(e.target.value)}
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              ≈ {Math.round(parseInt(freeTokens || "0") / 750)} halaman teks
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Admin</CardTitle>
          <CardDescription>Email yang menerima notifikasi sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Alamat Email</Label>
            <Input
              type="email"
              placeholder="admin@nexusai.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rekening Bank Penerima</CardTitle>
          <CardDescription>Rekening yang ditampilkan ke pengguna saat checkout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Nama Bank", placeholder: "BCA / Mandiri / BRI / BNI" },
            { label: "Nomor Rekening", placeholder: "1234567890" },
            { label: "Atas Nama", placeholder: "PT Nexus Teknologi Indonesia" },
          ].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input placeholder={f.placeholder} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Perubahan rekening akan ditampilkan di halaman billing pengguna
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        Simpan Semua Pengaturan
      </Button>
    </div>
  );
}
