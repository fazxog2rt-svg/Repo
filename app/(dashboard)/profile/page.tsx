"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Mail, Phone, Globe, Clock, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const TIMEZONES = [
  "Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura",
  "Asia/Singapore", "UTC", "America/New_York", "Europe/London",
];

const LANGUAGES = [
  { value: "id", label: "Bahasa Indonesia" },
  { value: "en", label: "English" },
];

const PLAN_BADGE_COLORS: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground",
  BASIC: "bg-blue-500/15 text-blue-400",
  PRO: "bg-nexus-500/15 text-nexus-400",
  PREMIUM: "bg-purple-500/15 text-purple-400",
  ENTERPRISE: "bg-gradient-to-r from-nexus-500/20 to-purple-500/20 text-nexus-300",
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "", bio: "", language: "id", timezone: "Asia/Jakarta" });

  const { data: userData, isLoading } = useQuery<{ data: any }>({
    queryKey: ["profile"],
    queryFn: () => fetch("/api/user/profile").then((r) => r.json()),
  });

  const user = userData?.data;

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        language: user.language || "id",
        timezone: user.timezone || "Asia/Jakarta",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) =>
      fetch("/api/user/profile", { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Profil berhasil diperbarui");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        toast.error(res.error || "Gagal memperbarui profil");
      }
    },
    onError: () => toast.error("Terjadi kesalahan"),
  });

  const plan = user?.subscriptions?.[0]?.plan;
  const planType = plan?.type || "FREE";
  const initials = (user?.name || user?.email || "U").slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-nexus-500/10">
          <User className="w-5 h-5 text-nexus-400" />
        </div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
      </div>

      <div className="space-y-6">
        {/* Avatar & info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback className="text-2xl bg-nexus-500/20 text-nexus-400">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-nexus-500 text-white shadow-md">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name || "Pengguna"}</h2>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PLAN_BADGE_COLORS[planType]}`}>
                  {planType}
                </span>
                <span className="text-xs text-muted-foreground">
                  Bergabung {user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy", { locale: id }) : "-"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informasi Pribadi</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nama lengkap..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">
                <Phone className="w-3.5 h-3.5 inline mr-1" />
                No. Telepon
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+62..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Ceritakan sedikit tentang diri Anda..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                <Globe className="w-3.5 h-3.5 inline mr-1" />
                Bahasa
              </Label>
              <select
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Zona Waktu
              </Label>
              <select
                value={form.timezone}
                onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={() => updateMutation.mutate(form)}
            disabled={updateMutation.isPending}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </motion.div>

        {/* Account info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Informasi Akun</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="outline">{user?.role || "USER"}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paket Aktif</span>
              <span className="font-medium">{plan?.name || "Free Plan"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Pengguna</span>
              <span className="font-mono text-xs text-muted-foreground">{user?.id?.slice(0, 8)}...</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
