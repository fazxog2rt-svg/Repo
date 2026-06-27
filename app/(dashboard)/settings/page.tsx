"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Moon, Sun, Monitor, Bell, Shield, Keyboard, Palette, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const THEME_OPTIONS = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
];

function SettingCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifEmail: true,
    notifBrowser: false,
    notifPayment: true,
    autoSave: true,
    streamingResponse: true,
    soundEffects: false,
    compactMode: false,
    showTokenCount: true,
    autoScroll: true,
    codeLineNumbers: true,
    markdownPreview: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
    toast.success("Pengaturan disimpan");
  };

  const shortcuts = [
    { keys: ["Ctrl", "K"], description: "Buka Command Palette" },
    { keys: ["Ctrl", "N"], description: "Chat baru" },
    { keys: ["Ctrl", "Enter"], description: "Kirim pesan" },
    { keys: ["Esc"], description: "Batalkan / Tutup" },
    { keys: ["Ctrl", "/"], description: "Tampilkan shortcut" },
    { keys: ["Ctrl", "B"], description: "Toggle sidebar" },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-nexus-500/10">
          <Settings className="w-5 h-5 text-nexus-400" />
        </div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SettingCard title="Tampilan" icon={Palette}>
            <div>
              <Label className="text-sm mb-3 block">Tema Warna</Label>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => { setTheme(value); toast.success(`Tema diubah ke ${label}`); }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      theme === value
                        ? "border-nexus-500 bg-nexus-500/10 text-nexus-400"
                        : "border-border hover:border-border/80 text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <ToggleSetting
              label="Mode Kompak"
              description="Tampilkan lebih banyak konten dalam layar"
              checked={settings.compactMode}
              onChange={() => toggle("compactMode")}
            />
          </SettingCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SettingCard title="Chat & AI" icon={Globe}>
            <ToggleSetting
              label="Streaming Response"
              description="Tampilkan respons AI secara real-time kata per kata"
              checked={settings.streamingResponse}
              onChange={() => toggle("streamingResponse")}
            />
            <ToggleSetting
              label="Auto Simpan"
              description="Simpan riwayat chat secara otomatis"
              checked={settings.autoSave}
              onChange={() => toggle("autoSave")}
            />
            <ToggleSetting
              label="Auto Scroll"
              description="Scroll otomatis saat respons baru datang"
              checked={settings.autoScroll}
              onChange={() => toggle("autoScroll")}
            />
            <ToggleSetting
              label="Tampilkan Token"
              description="Tampilkan jumlah token yang digunakan"
              checked={settings.showTokenCount}
              onChange={() => toggle("showTokenCount")}
            />
            <ToggleSetting
              label="Nomor Baris Kode"
              description="Tampilkan nomor baris di blok kode"
              checked={settings.codeLineNumbers}
              onChange={() => toggle("codeLineNumbers")}
            />
          </SettingCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SettingCard title="Notifikasi" icon={Bell}>
            <ToggleSetting
              label="Notifikasi Email"
              description="Terima notifikasi melalui email"
              checked={settings.notifEmail}
              onChange={() => toggle("notifEmail")}
            />
            <ToggleSetting
              label="Notifikasi Browser"
              description="Tampilkan notifikasi push di browser"
              checked={settings.notifBrowser}
              onChange={() => toggle("notifBrowser")}
            />
            <ToggleSetting
              label="Notifikasi Pembayaran"
              description="Terima update status pembayaran"
              checked={settings.notifPayment}
              onChange={() => toggle("notifPayment")}
            />
            <ToggleSetting
              label="Efek Suara"
              description="Putar suara saat pesan diterima"
              checked={settings.soundEffects}
              onChange={() => toggle("soundEffects")}
            />
          </SettingCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SettingCard title="Keyboard Shortcuts" icon={Keyboard}>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.description} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((k) => (
                      <kbd key={k} className="px-1.5 py-0.5 rounded text-xs font-mono bg-muted border border-border/50">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SettingCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SettingCard title="Zona Berbahaya" icon={Shield}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Hapus Semua Riwayat</p>
                  <p className="text-xs text-muted-foreground">Hapus semua riwayat percakapan permanen</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => toast.error("Konfirmasi diperlukan")}>
                  Hapus
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Hapus Akun</p>
                  <p className="text-xs text-muted-foreground">Hapus akun dan semua data secara permanen</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => toast.error("Hubungi admin untuk menghapus akun")}>
                  Hapus Akun
                </Button>
              </div>
            </div>
          </SettingCard>
        </motion.div>
      </div>
    </div>
  );
}
