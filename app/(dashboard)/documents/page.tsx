"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookText, Plus, Trash2, Search, Edit3, Eye, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Document | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const { data, isLoading } = useQuery<{ data: Document[] }>({
    queryKey: ["documents"],
    queryFn: () => fetch("/api/documents").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (doc: { title: string; content: string }) =>
      fetch("/api/documents", { method: "POST", body: JSON.stringify(doc), headers: { "Content-Type": "application/json" } }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Dokumen dibuat");
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        setSelected(res.data);
        setEditing(false);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; content: string } }) =>
      fetch(`/api/documents/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then((r) => r.json()),
    onSuccess: () => {
      toast.success("Dokumen disimpan");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => fetch(`/api/documents/${docId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Dokumen dihapus");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setSelected(null);
    },
  });

  const docs = (data?.data || []).filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => {
    setSelected(null);
    setEditTitle("Dokumen Baru");
    setEditContent("");
    setEditing(true);
  };

  const handleEdit = (doc: Document) => {
    setSelected(doc);
    setEditTitle(doc.title);
    setEditContent(doc.content);
    setEditing(true);
  };

  const handleSave = () => {
    if (selected) {
      updateMutation.mutate({ id: selected.id, data: { title: editTitle, content: editContent } });
    } else {
      createMutation.mutate({ title: editTitle, content: editContent });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-muted/20">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Dokumen</h2>
            <button onClick={handleNew} className="p-1 rounded-md hover:bg-muted transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-1">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Belum ada dokumen</p>
            </div>
          ) : (
            docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => { setSelected(doc); setEditing(false); }}
                className={cn(
                  "w-full text-left p-2.5 rounded-lg transition-colors mb-1",
                  selected?.id === doc.id ? "bg-nexus-500/15 text-nexus-400" : "hover:bg-muted"
                )}
              >
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true, locale: id })}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {editing ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-bold border-0 focus-visible:ring-0 bg-transparent px-0 text-foreground"
                placeholder="Judul Dokumen"
              />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Batal</Button>
                <Button size="sm" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="gap-1.5">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan
                </Button>
              </div>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 p-6 resize-none outline-none bg-transparent text-sm leading-relaxed font-mono"
              placeholder="Mulai menulis dokumen Anda..."
            />
          </div>
        ) : selected ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold">{selected.title}</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(selected)} className="gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(selected.id)} className="gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{selected.content}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="p-6 rounded-2xl bg-muted/30">
              <BookText className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <div className="text-center">
              <p className="font-medium">Pilih dokumen atau buat baru</p>
              <p className="text-sm text-muted-foreground mt-1">Buat dan kelola dokumen Anda di sini</p>
            </div>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Buat Dokumen Baru
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
