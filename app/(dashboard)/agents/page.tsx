"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Plus, Edit2, Trash2, Play, Globe, Lock, ChevronDown, ChevronUp, Cpu, Thermometer, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  systemPrompt: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  isPublic: boolean;
  createdAt: string;
}

const POPULAR_MODELS = [
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "anthropic/claude-3-haiku", label: "Claude 3 Haiku" },
  { id: "google/gemini-flash-1.5", label: "Gemini Flash 1.5" },
  { id: "meta-llama/llama-3.1-70b-instruct", label: "Llama 3.1 70B" },
  { id: "mistralai/mistral-7b-instruct", label: "Mistral 7B" },
];

const AGENT_TEMPLATES = [
  {
    name: "Asisten Riset",
    description: "Membantu riset mendalam dan analisis informasi",
    systemPrompt: "Kamu adalah asisten riset yang teliti dan mendalam. Bantu pengguna menganalisis informasi, menemukan pola, dan menyajikan temuan secara terstruktur. Selalu berikan sumber referensi jika memungkinkan.",
    modelId: "anthropic/claude-3.5-sonnet",
    temperature: 0.3,
  },
  {
    name: "Penulis Kreatif",
    description: "Membantu menulis konten kreatif berkualitas tinggi",
    systemPrompt: "Kamu adalah penulis kreatif yang berbakat. Bantu pengguna membuat konten yang menarik, engaging, dan berkualitas tinggi. Sesuaikan gaya penulisan dengan kebutuhan pengguna.",
    modelId: "openai/gpt-4o",
    temperature: 0.9,
  },
  {
    name: "Programmer Expert",
    description: "Membantu coding, debugging, dan arsitektur software",
    systemPrompt: "Kamu adalah programmer senior yang berpengalaman dalam berbagai bahasa pemrograman. Bantu pengguna menulis kode yang bersih, efisien, dan best practice. Jelaskan logika di balik kode yang kamu tulis.",
    modelId: "openai/gpt-4o",
    temperature: 0.1,
  },
  {
    name: "Tutor Bahasa",
    description: "Mengajar dan mempraktikkan bahasa asing",
    systemPrompt: "Kamu adalah tutor bahasa yang sabar dan berpengalaman. Bantu pengguna belajar bahasa baru dengan cara yang menyenangkan dan efektif. Berikan koreksi yang konstruktif dan penjelasan yang jelas.",
    modelId: "openai/gpt-4o-mini",
    temperature: 0.7,
  },
];

const emptyForm = {
  name: "",
  description: "",
  systemPrompt: "",
  modelId: "openai/gpt-4o",
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  isPublic: false,
  avatar: "",
};

export default function AgentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
  });

  const agents: Agent[] = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal membuat agent");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setIsCreateOpen(false);
      setFormData(emptyForm);
      toast.success("Agent berhasil dibuat!");
    },
    onError: () => toast.error("Gagal membuat agent"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof emptyForm> }) => {
      const res = await fetch(`/api/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal mengupdate agent");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setEditingAgent(null);
      setFormData(emptyForm);
      toast.success("Agent berhasil diupdate!");
    },
    onError: () => toast.error("Gagal mengupdate agent"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus agent");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setDeleteConfirm(null);
      toast.success("Agent berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus agent"),
  });

  function openCreate() {
    setFormData(emptyForm);
    setShowAdvanced(false);
    setIsCreateOpen(true);
  }

  function openEdit(agent: Agent) {
    setFormData({
      name: agent.name,
      description: agent.description || "",
      systemPrompt: agent.systemPrompt,
      modelId: agent.modelId,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      topP: agent.topP,
      presencePenalty: agent.presencePenalty,
      frequencyPenalty: agent.frequencyPenalty,
      isPublic: agent.isPublic,
      avatar: agent.avatar || "",
    });
    setShowAdvanced(false);
    setEditingAgent(agent);
  }

  function applyTemplate(template: (typeof AGENT_TEMPLATES)[0]) {
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      systemPrompt: template.systemPrompt,
      modelId: template.modelId,
      temperature: template.temperature,
    }));
  }

  function handleSubmit() {
    if (!formData.name.trim() || !formData.systemPrompt.trim()) {
      toast.error("Nama dan system prompt harus diisi");
      return;
    }
    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  const isOpen = isCreateOpen || !!editingAgent;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Buat dan kelola AI agent dengan persona dan kemampuan khusus
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Buat Agent
        </Button>
      </div>

      {/* Templates */}
      {agents.length === 0 && !isLoading && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Mulai dengan template:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGENT_TEMPLATES.map((t) => (
              <motion.div key={t.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => { applyTemplate(t); setIsCreateOpen(true); }}
                >
                  <CardContent className="p-4">
                    <Bot className="w-6 h-6 text-primary mb-2" />
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Agents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="group hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                          {agent.avatar || "🤖"}
                        </div>
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-0.5">
                            {agent.isPublic ? (
                              <Globe className="w-3 h-3 text-green-500" />
                            ) : (
                              <Lock className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {agent.isPublic ? "Publik" : "Privat"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {agent.description && (
                      <CardDescription className="mt-2 line-clamp-2">{agent.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3" />
                        <span className="truncate">{POPULAR_MODELS.find((m) => m.id === agent.modelId)?.label || agent.modelId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-3 h-3" />
                        <span>Temperatur: {agent.temperature}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/chat?agentId=${agent.id}`)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Gunakan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(agent)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(agent.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada agent</p>
          <p className="text-sm mt-1">Buat agent pertama Anda untuk memulai</p>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={(v: boolean) => { if (!v) { setIsCreateOpen(false); setEditingAgent(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAgent ? "Edit Agent" : "Buat Agent Baru"}</DialogTitle>
          </DialogHeader>

          {/* Templates (only in create mode) */}
          {!editingAgent && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Template cepat:</p>
              <div className="flex flex-wrap gap-2">
                {AGENT_TEMPLATES.map((t) => (
                  <Badge
                    key={t.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => applyTemplate(t)}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nama Agent *</Label>
                <Input
                  placeholder="Asisten Saya"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Avatar (emoji)</Label>
                <Input
                  placeholder="🤖"
                  maxLength={4}
                  value={formData.avatar}
                  onChange={(e) => setFormData((p) => ({ ...p, avatar: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Input
                placeholder="Apa yang dilakukan agent ini?"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>System Prompt *</Label>
              <Textarea
                placeholder="Deskripsikan perilaku, kepribadian, dan kemampuan agent ini..."
                rows={5}
                value={formData.systemPrompt}
                onChange={(e) => setFormData((p) => ({ ...p, systemPrompt: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">{formData.systemPrompt.length} / 10000 karakter</p>
            </div>

            <div className="space-y-1.5">
              <Label>Model AI</Label>
              <Select value={formData.modelId} onValueChange={(v: string) => setFormData((p) => ({ ...p, modelId: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Settings */}
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Pengaturan Lanjutan
            </button>

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 border rounded-lg p-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Temperatur</Label>
                    <span className="text-sm text-muted-foreground">{formData.temperature}</span>
                  </div>
                  <Slider
                    min={0} max={2} step={0.1}
                    value={[formData.temperature]}
                    onValueChange={(vals: number[]) => setFormData((p) => ({ ...p, temperature: vals[0] }))}
                  />
                  <p className="text-xs text-muted-foreground">0 = deterministik, 2 = sangat kreatif</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Top P</Label>
                    <span className="text-sm text-muted-foreground">{formData.topP}</span>
                  </div>
                  <Slider
                    min={0} max={1} step={0.05}
                    value={[formData.topP]}
                    onValueChange={(vals: number[]) => setFormData((p) => ({ ...p, topP: vals[0] }))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Max Tokens</Label>
                    <span className="text-sm text-muted-foreground">{formData.maxTokens.toLocaleString()}</span>
                  </div>
                  <Slider
                    min={256} max={128000} step={256}
                    value={[formData.maxTokens]}
                    onValueChange={(vals: number[]) => setFormData((p) => ({ ...p, maxTokens: vals[0] }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Presence Penalty</Label>
                      <span className="text-sm text-muted-foreground">{formData.presencePenalty}</span>
                    </div>
                    <Slider
                      min={-2} max={2} step={0.1}
                      value={[formData.presencePenalty]}
                      onValueChange={(vals: number[]) => setFormData((p) => ({ ...p, presencePenalty: vals[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Frequency Penalty</Label>
                      <span className="text-sm text-muted-foreground">{formData.frequencyPenalty}</span>
                    </div>
                    <Slider
                      min={-2} max={2} step={0.1}
                      value={[formData.frequencyPenalty]}
                      onValueChange={(vals: number[]) => setFormData((p) => ({ ...p, frequencyPenalty: vals[0] }))}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Agent Publik</p>
                <p className="text-xs text-muted-foreground">Bisa digunakan oleh semua pengguna</p>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, isPublic: v }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setIsCreateOpen(false); setEditingAgent(null); }}
            >
              <X className="w-4 h-4 mr-1" />
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Check className="w-4 h-4 mr-1" />
              {editingAgent ? "Simpan Perubahan" : "Buat Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(v: boolean) => !v && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Agent?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Agent ini akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
