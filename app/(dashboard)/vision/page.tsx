"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, Upload, Loader2, Copy, FileImage, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const VISION_PROMPTS = [
  "Apa yang ada di gambar ini? Jelaskan secara detail.",
  "Ekstrak semua teks yang terlihat dalam gambar ini.",
  "Analisis gambar ini dan berikan insight mendalam.",
  "Identifikasi objek, warna, dan komposisi gambar.",
];

export default function VisionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("Apa yang ada di gambar ini? Jelaskan secara detail.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 20MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!image || !imageFile) {
      toast.error("Upload gambar terlebih dahulu");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("prompt", prompt);

      const res = await fetch("/api/vision/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success && data.result) {
        setResult(data.result);
      } else {
        toast.error(data.error || "Gagal menganalisis gambar");
      }
    } catch {
      toast.error("Terjadi kesalahan. Pastikan API Key telah dikonfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-blue-500/10">
          <Eye className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vision & OCR</h1>
          <p className="text-sm text-muted-foreground">Analisis gambar dan ekstrak teks menggunakan AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload & Controls */}
        <div className="space-y-4">
          {/* Upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "relative rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden",
              dragOver ? "border-nexus-500 bg-nexus-500/5" : "border-border hover:border-muted-foreground/40"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            {image ? (
              <div className="relative">
                <img src={image} alt="Upload" className="w-full h-64 object-contain bg-muted/30" />
                <button
                  onClick={(e) => { e.stopPropagation(); setImage(null); setImageFile(null); setResult(null); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="p-4 rounded-2xl bg-muted/50">
                  <FileImage className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Drag & drop atau klik untuk upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP, GIF hingga 20MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Prompt */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Label>Instruksi Analisis</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Apa yang ingin Anda ketahui tentang gambar ini?"
              rows={3}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {VISION_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className="text-xs px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                >
                  {p.slice(0, 35)}...
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading || !image}
            className="w-full gap-2 h-11"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Menganalisis...</>
            ) : (
              <><Wand2 className="w-4 h-4" />Analisis Gambar</>
            )}
          </Button>
        </div>

        {/* Right: Result */}
        <div className="rounded-2xl border border-border bg-card p-5 min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Hasil Analisis</h3>
            {result && (
              <button
                onClick={() => { navigator.clipboard.writeText(result); toast.success("Disalin!"); }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-nexus-400" />
              <p className="text-sm text-muted-foreground">AI sedang menganalisis gambar...</p>
            </div>
          ) : result ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
              <Eye className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">Hasil analisis akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
