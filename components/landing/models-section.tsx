"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

const modelProviders = [
  {
    name: "OpenAI",
    icon: "🤖",
    models: ["GPT-4o", "GPT-4o Mini", "o1", "o3-mini", "GPT-5"],
    color: "from-green-400 to-emerald-600",
    bg: "from-green-500/10 to-emerald-500/5",
  },
  {
    name: "Anthropic",
    icon: "🔮",
    models: ["Claude Opus 4.8", "Claude Sonnet 4.6", "Claude Haiku 4.5", "Claude 3.7"],
    color: "from-violet-400 to-purple-600",
    bg: "from-violet-500/10 to-purple-500/5",
  },
  {
    name: "Google",
    icon: "🌐",
    models: ["Gemini 2.5 Pro", "Gemini 2.0 Flash", "Gemini 1.5 Pro", "Gemma 3"],
    color: "from-blue-400 to-cyan-600",
    bg: "from-blue-500/10 to-cyan-500/5",
  },
  {
    name: "DeepSeek",
    icon: "🔍",
    models: ["DeepSeek R1", "DeepSeek V3", "DeepSeek Coder", "DeepSeek V2.5"],
    color: "from-orange-400 to-red-600",
    bg: "from-orange-500/10 to-red-500/5",
  },
  {
    name: "Meta Llama",
    icon: "🦙",
    models: ["Llama 3.3 70B", "Llama 3.1 405B", "Llama 3.2 11B Vision", "Llama 4 Scout"],
    color: "from-teal-400 to-green-600",
    bg: "from-teal-500/10 to-green-500/5",
  },
  {
    name: "xAI (Grok)",
    icon: "✖️",
    models: ["Grok 3", "Grok 3 Mini", "Grok 2", "Grok Vision"],
    color: "from-pink-400 to-rose-600",
    bg: "from-pink-500/10 to-rose-500/5",
  },
  {
    name: "Qwen (Alibaba)",
    icon: "🌸",
    models: ["Qwen3 235B", "Qwen3 72B", "Qwen2.5 Coder", "QwQ 32B"],
    color: "from-red-400 to-orange-600",
    bg: "from-red-500/10 to-orange-500/5",
  },
  {
    name: "Mistral AI",
    icon: "💫",
    models: ["Mistral Large 2", "Mixtral 8x22B", "Codestral", "Mistral Small"],
    color: "from-amber-400 to-yellow-600",
    bg: "from-amber-500/10 to-yellow-500/5",
  },
];

export function ModelsSection() {
  return (
    <section id="models" className="relative py-24 bg-[#050510]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nexus-500/30 bg-nexus-500/10 text-nexus-400 text-sm mb-4">
            <Cpu className="w-4 h-4" />
            100+ Model AI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Pilih Model Terbaik
            <br />
            <span className="bg-gradient-to-r from-nexus-400 to-purple-400 bg-clip-text text-transparent">
              untuk Setiap Kebutuhan
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Gunakan API Key OpenRouter Anda sendiri. Daftar model diperbarui otomatis setiap saat.
          </p>
        </motion.div>

        {/* Provider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modelProviders.map((provider, i) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className={`rounded-2xl p-5 border border-white/5 bg-gradient-to-br ${provider.bg} hover:border-white/15 transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{provider.icon}</span>
                <div>
                  <div
                    className={`text-sm font-bold bg-gradient-to-r ${provider.color} bg-clip-text text-transparent`}
                  >
                    {provider.name}
                  </div>
                </div>
              </div>
              <ul className="space-y-1.5">
                {provider.models.map((model) => (
                  <li key={model} className="flex items-center gap-2 text-sm text-white/60">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${provider.color}`} />
                    {model}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* More models badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 text-white/60 text-sm">
            <span>Dan masih banyak lagi: Perplexity, Cohere, NVIDIA, Together AI, dan 80+ provider lainnya</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
