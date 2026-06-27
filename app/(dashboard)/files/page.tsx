"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FolderOpen, Upload, Trash2, Download, FileText, FileImage, File, Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  csv: FileText,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  webp: FileImage,
  gif: FileImage,
};

const FILE_COLORS: Record<string, string> = {
  pdf: "text-red-400 bg-red-400/10",
  doc: "text-blue-400 bg-blue-400/10",
  docx: "text-blue-400 bg-blue-400/10",
  txt: "text-gray-400 bg-gray-400/10",
  csv: "text-green-400 bg-green-400/10",
  png: "text-purple-400 bg-purple-400/10",
  jpg: "text-purple-400 bg-purple-400/10",
  jpeg: "text-purple-400 bg-purple-400/10",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  fileType: string;
  createdAt: string;
}

export default function FilesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<{ data: FileItem[] }>({
    queryKey: ["files"],
    queryFn: () => fetch("/api/files").then((r) => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/files/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("File dihapus");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const uploadFile = useCallback(async (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("Ukuran file maksimal 50MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        toast.success("File berhasil diupload");
        queryClient.invalidateQueries({ queryKey: ["files"] });
      } else {
        toast.error(data.error || "Gagal mengupload file");
      }
    } catch {
      toast.error("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  }, [queryClient]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  };

  const files = (data?.data || []).filter((f) =>
    f.originalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10">
            <FolderOpen className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">File Manager</h1>
            <p className="text-sm text-muted-foreground">{files.length} file tersimpan</p>
          </div>
        </div>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload File
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => Array.from(e.target.files || []).forEach(uploadFile)}
        />
      </div>

      {/* Upload drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed p-8 text-center mb-6 transition-all",
          dragOver ? "border-nexus-500 bg-nexus-500/5" : "border-border/50"
        )}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Mengupload...</span>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag & drop file ke sini, atau{" "}
              <button onClick={() => fileRef.current?.click()} className="text-nexus-400 hover:underline">
                pilih file
              </button>
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              PDF, DOCX, TXT, CSV, PNG, JPG, MP3, MP4 (maks 50MB)
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari file..."
          className="pl-10"
        />
      </div>

      {/* Files list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">{search ? "Tidak ada file yang cocok" : "Belum ada file"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file, i) => {
            const ext = file.originalName.split(".").pop()?.toLowerCase() || "";
            const Icon = FILE_ICONS[ext] || File;
            const colorClass = FILE_COLORS[ext] || "text-gray-400 bg-gray-400/10";

            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-border bg-card/50 hover:bg-card transition-all"
              >
                <div className={cn("p-2.5 rounded-xl shrink-0", colorClass)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    <span className="text-xs text-muted-foreground/40">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true, locale: id })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={file.url} download={file.originalName} target="_blank" rel="noopener noreferrer">
                    <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </a>
                  <button
                    onClick={() => deleteMutation.mutate(file.id)}
                    className="p-1.5 rounded-md text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
