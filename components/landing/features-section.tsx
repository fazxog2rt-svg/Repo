"use client";

import { motion } from "framer-motion";
import {
  MessageSquare, Image, Eye, FileText, Mic, Layout,
  BookOpen, Bot, History, Star, FolderOpen, CreditCard,
  Bell, Key, Settings, Code2, Search, Languages, Zap,
  Brain, Video, Globe, Table, Kanban
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    description: "Chat streaming dengan 100+ model AI. Markdown, LaTeX, Mermaid, syntax highlight, multi-chat, folder, pin, export, share.",
    color: "from-blue-500 to-cyan-500",
    highlight: true,
  },
  {
    icon: Image,
    title: "AI Image",
    description: "Generate gambar dengan model DALL-E, Stable Diffusion, Midjourney melalui OpenRouter.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Eye,
    title: "AI Vision",
    description: "Analisis gambar, OCR, dan pemahaman visual dengan model multimodal terkini.",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: FileText,
    title: "AI Files",
    description: "Upload dan analisis PDF, DOCX, XLSX, PPTX, CSV. AI membaca dan memahami dokumen Anda.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Mic,
    title: "AI Voice",
    description: "Speech-to-Text, Text-to-Speech, dan Voice Chat. Konversasi dengan AI menggunakan suara.",
    color: "from-rose-500 to-red-500",
  },
  {
    icon: Layout,
    title: "AI Workspace",
    description: "Workspace seperti Notion dengan Markdown, Rich Text, Tabel, Kanban, Kalender, dan AI Assistant.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: BookOpen,
    title: "Prompt Library",
    description: "100+ prompt siap pakai untuk Coding, Marketing, Business, SEO, Research. Buat dan bagikan prompt Anda.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description: "Buat AI Agent dengan kepribadian, system prompt, dan setting model sendiri. Simpan dan gunakan kapan saja.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Code2,
    title: "Coding Assistant",
    description: "Debugger, SQL Generator, Regex Generator, Code Review. Teman coding yang cerdas.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Languages,
    title: "AI Translator",
    description: "Terjemah teks, Grammar Checker, Rewrite, dan Email Writer dengan kualitas tinggi.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Brain,
    title: "Research Assistant",
    description: "Mind Map, Brainstorm, Meeting Summary, dan Research Assistant untuk produktivitas maksimal.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Globe,
    title: "Web & YouTube Summary",
    description: "Rangkum konten website dan video YouTube secara otomatis dengan AI.",
    color: "from-pink-500 to-rose-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-[#050510]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nexus-950/20 to-transparent" />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nexus-500/30 bg-nexus-500/10 text-nexus-400 text-sm mb-4">
            <Zap className="w-4 h-4" />
            Fitur Lengkap
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Semua yang Anda Butuhkan
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Platform AI paling lengkap dengan 20+ fitur canggih yang terintegrasi dalam satu dashboard modern.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`relative group rounded-2xl p-5 border cursor-default ${
                feature.highlight
                  ? "border-nexus-500/40 bg-nexus-500/5"
                  : "border-white/5 bg-white/[0.02]"
              } hover:border-white/20 transition-all duration-300`}
            >
              {/* Glow on hover */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <feature.icon className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
