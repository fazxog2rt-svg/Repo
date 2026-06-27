"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const statsItems = [
  { label: "Model AI", value: "100+" },
  { label: "Pengguna Aktif", value: "50K+" },
  { label: "Pesan per Hari", value: "1M+" },
  { label: "Uptime", value: "99.9%" },
];

const floatingModels = [
  { name: "GPT-5", color: "from-green-400 to-emerald-600", x: -20, y: -30 },
  { name: "Claude", color: "from-purple-400 to-violet-600", x: 20, y: -20 },
  { name: "Gemini", color: "from-blue-400 to-cyan-600", x: -25, y: 25 },
  { name: "DeepSeek", color: "from-orange-400 to-red-500", x: 25, y: 20 },
  { name: "Llama", color: "from-teal-400 to-green-600", x: 0, y: -40 },
  { name: "Grok", color: "from-pink-400 to-rose-600", x: 0, y: 40 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0520] to-[#050510]" />

        {/* Glowing orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-nexus-600/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div {...fadeUp} className="inline-flex mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-nexus-500/30 bg-nexus-500/10 text-nexus-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Platform AI Terlengkap di Indonesia</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] mb-6"
        >
          <span className="text-white">Semua Model AI</span>
          <br />
          <span className="bg-gradient-to-r from-nexus-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dalam Satu Platform
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Akses GPT-5, Claude, Gemini, DeepSeek, Llama, dan 100+ model AI lainnya.
          Gunakan API Key OpenRouter Anda sendiri. Chat, Image, Vision, Voice, dan lebih banyak lagi.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button size="xl" variant="gradient" asChild className="gap-2 text-base shine">
            <Link href="/register">
              <Sparkles className="w-5 h-5" />
              Mulai Gratis Sekarang
            </Link>
          </Button>
          <Button
            size="xl"
            asChild
            className="gap-2 text-base bg-white/5 border border-white/10 text-white hover:bg-white/10"
          >
            <Link href="#features">
              Lihat Semua Fitur
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>

        {/* Floating Model Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative flex justify-center mb-16"
        >
          <div className="relative w-64 h-64">
            {/* Center orb */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border border-nexus-500/30 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nexus-500 to-purple-600 flex items-center justify-center shadow-glow">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Floating badges */}
            {floatingModels.map((model, i) => (
              <motion.div
                key={model.name}
                animate={{
                  y: [model.y, model.y - 10, model.y],
                  x: [model.x, model.x + 5, model.x],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(calc(-50% + ${model.x * 4}px), calc(-50% + ${model.y * 4}px))`,
                }}
              >
                <div
                  className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${model.color} text-white text-xs font-semibold shadow-lg`}
                >
                  {model.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          {statsItems.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-6 mt-12"
        >
          {[
            { icon: Shield, label: "Enkripsi AES-256" },
            { icon: Zap, label: "Response Real-time" },
            { icon: Globe, label: "99.9% Uptime" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/40 text-sm">
              <Icon className="w-4 h-4 text-nexus-400" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
