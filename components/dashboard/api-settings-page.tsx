"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Key, Shield, Eye, EyeOff, Check, ExternalLink,
  Trash2, Loader2, AlertCircle, Info
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface ApiKeyRecord {
  id: string;
  name: string;
  isActive: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export function ApiSettingsPage({ apiKey }: { apiKey: ApiKeyRecord | null }) {
  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentKey, setCurrentKey] = useState(apiKey);

  const handleSave = async () => {
    if (!inputKey.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: inputKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("API Key berhasil disimpan dan terverifikasi");
      setCurrentKey(data.data);
      setInputKey("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/api-key", { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("API Key berhasil dihapus");
      setCurrentKey(null);
    } catch {
      toast.error("Gagal menghapus API Key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">API Settings</h1>
        <p className="text-muted-foreground">Kelola OpenRouter API Key Anda</p>
      </div>

      {/* Security Info */}
      <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-400 text-sm">Keamanan API Key Anda</p>
              <ul className="mt-2 space-y-1 text-xs text-blue-400/70">
                <li>• API Key dienkripsi dengan AES-256 sebelum disimpan di server</li>
                <li>• API Key tidak pernah dikirim atau ditampilkan ke frontend</li>
                <li>• Hanya digunakan untuk mengirim permintaan ke OpenRouter API</li>
                <li>• Anda dapat menghapus API Key kapan saja</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Key Status */}
      {currentKey && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{currentKey.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Ditambahkan {formatDate(currentKey.createdAt)}
                    {currentKey.lastUsedAt && ` · Terakhir digunakan ${formatDate(currentKey.lastUsedAt)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Aktif</Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-4 h-4" />
            {currentKey ? "Ganti API Key" : "Tambah OpenRouter API Key"}
          </CardTitle>
          <CardDescription>
            Dapatkan API Key Anda di{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nexus-400 hover:underline inline-flex items-center gap-1"
            >
              openrouter.ai/keys
              <ExternalLink className="w-3 h-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-or-v1-..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              onClick={handleSave}
              disabled={!inputKey.trim() || loading}
              className="w-full bg-gradient-to-r from-nexus-500 to-purple-600 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan & Verifikasi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How to get key */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" />
            Cara Mendapatkan OpenRouter API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[
              { step: "1", text: "Buka openrouter.ai dan buat akun gratis" },
              { step: "2", text: "Pergi ke dashboard dan pilih 'Keys'" },
              { step: "3", text: "Klik 'Create Key' dan beri nama" },
              { step: "4", text: "Salin API Key dan paste di field di atas" },
              { step: "5", text: "Isi saldo credit di OpenRouter untuk menggunakan model" },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-nexus-500/20 text-nexus-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {step}
                </span>
                {text}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
