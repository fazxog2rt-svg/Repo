"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Eye, EyeOff, Loader2, Github, Mail } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Email atau password salah");
      } else {
        router.push("/chat");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: "/chat" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510] p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-nexus-600/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Nexus<span className="text-nexus-400">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4 mb-1">Selamat Datang Kembali</h1>
          <p className="text-white/50 text-sm">Masuk untuk melanjutkan ke NexusAI</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 space-y-4">
          {/* OAuth Buttons */}
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
                  <>
                    <span>{typeof icon === "string" ? icon : icon}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">atau dengan email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-nexus-500"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-nexus-400 hover:underline">
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-nexus-500 to-purple-600 text-white hover:shadow-glow"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Masuk
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-nexus-400 hover:underline font-medium">
            Daftar gratis
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
