"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Eye, EyeOff, Loader2, Github, Check } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const passwordStrength = (() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registrasi gagal");

      toast.success("Akun berhasil dibuat! Masuk sekarang.");
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.ok) router.push("/chat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: "/chat" });
  };

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510] p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-nexus-600/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Nexus<span className="text-nexus-400">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4 mb-1">Buat Akun Baru</h1>
          <p className="text-white/50 text-sm">Mulai gratis dengan 10.000 token</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { provider: "google", label: "Google", icon: "🌐" },
              { provider: "github", label: "GitHub", icon: <Github className="w-4 h-4" /> },
              { provider: "discord", label: "Discord", icon: "🎮" },
            ].map(({ provider, label, icon }) => (
              <button
                key={provider}
                onClick={() => handleOAuth(provider)}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm disabled:opacity-50"
              >
                {oauthLoading === provider ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>{typeof icon === "string" ? icon : icon}<span className="hidden sm:inline">{label}</span></>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">atau dengan email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Nama Lengkap</label>
              <Input
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-nexus-500"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-nexus-500"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-nexus-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="flex gap-1 mt-1.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Konfirmasi Password</label>
              <Input
                type="password"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-nexus-500"
              />
              {form.confirmPassword && form.password === form.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs">
                  <Check className="w-3 h-3" /> Password cocok
                </div>
              )}
            </div>

            <p className="text-xs text-white/30">
              Dengan mendaftar, Anda menyetujui{" "}
              <Link href="/terms" className="text-nexus-400 hover:underline">Syarat & Ketentuan</Link>{" "}
              dan{" "}
              <Link href="/privacy" className="text-nexus-400 hover:underline">Kebijakan Privasi</Link> kami.
            </p>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-nexus-500 to-purple-600 text-white hover:shadow-glow"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Buat Akun
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-nexus-400 hover:underline font-medium">
            Masuk
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
