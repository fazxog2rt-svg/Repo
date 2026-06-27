"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Wand2, Download, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const IMAGE_SIZES = ["256x256", "512x512", "1024x1024", "1024x1792", "1792x1024"];
const IMAGE_MODELS = [
  { id: "openai/dall-e-3", name: "DALL·E 3", badge: "Popular" },
  { id: "openai/dall-e-2", name: "DALL·E 2", badge: null },
  { id: "stability/stable-diffusion-xl", name: "Stable Diffusion XL", badge: "Open Source" },
];

const EXAMPLE_PROMPTS = [
  "A cyberpunk city at night with neon lights reflecting on wet streets",
  "A magical forest with glowing mushrooms and floating fireflies",
  "A futuristic AI robot painting a masterpiece in a studio",
  "A serene Japanese garden with cherry blossoms falling",
];

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [model, setModel] = useState("openai/dall-e-3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Masukkan deskripsi gambar");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, model }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        setResult(data.url);
      } else {
        setError(data.error || "Gagal menghasilkan gambar");
      }
    } catch {
      setError("Terjadi kesalahan. Pastikan API Key telah dikonfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-purple-500/10">
          <ImageIcon className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Image Generator</h1>
          <p className="text-sm text-muted-foreground">Buat gambar dari deskripsi teks menggunakan AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-5">
          {/* Prompt */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Label>Deskripsi Gambar</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Deskripsikan gambar yang ingin dibuat... Semakin detail semakin baik hasilnya."
              rows={5}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="text-xs px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors truncate max-w-full"
                >
                  {ex.slice(0, 40)}...
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Label>Model</Label>
            <div className="space-y-2">
              {IMAGE_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                    model === m.id
                      ? "border-nexus-500 bg-nexus-500/10"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <span className="text-sm font-medium">{m.name}</span>
                  {m.badge && (
                    <Badge variant="secondary" className="text-xs">{m.badge}</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Label>Ukuran Gambar</Label>
            <div className="grid grid-cols-3 gap-2">
              {IMAGE_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "p-2 rounded-lg border text-xs font-medium transition-all",
                    size === s
                      ? "border-nexus-500 bg-nexus-500/10 text-nexus-400"
                      : "border-border text-muted-foreground hover:border-muted-foreground/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full gap-2 h-11"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Menghasilkan...</>
            ) : (
              <><Wand2 className="w-4 h-4" />Generate Gambar</>
            )}
          </Button>
        </div>

        {/* Right: Preview */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-nexus-500/20 border-t-nexus-500 animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-nexus-400" />
              </div>
              <p className="text-sm text-muted-foreground">Membuat gambar Anda...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-destructive/60" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : result ? (
            <div className="relative">
              <img src={result} alt={prompt} className="w-full h-auto" />
              <div className="absolute bottom-3 right-3">
                <a href={result} download="generated-image.png" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="secondary" className="gap-2 shadow-lg">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3 p-6 text-center">
              <div className="p-4 rounded-2xl bg-muted/50">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground text-sm">
                Masukkan deskripsi dan klik Generate untuk membuat gambar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
