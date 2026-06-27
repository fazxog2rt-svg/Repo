"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building2, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: 0,
    period: "selamanya",
    description: "Mulai dengan model dasar",
    icon: Zap,
    color: "from-gray-400 to-gray-500",
    features: [
      "10.000 token/bulan",
      "Model dasar (GPT-4o Mini, Gemini Flash)",
      "5 chat tersimpan",
      "1 AI Agent",
      "Upload file 5MB",
      "Prompt Library dasar",
    ],
    notIncluded: [
      "Model premium",
      "AI Image Generation",
      "Voice Chat",
      "Priority Support",
    ],
    cta: "Mulai Gratis",
    href: "/register",
    popular: false,
  },
  {
    name: "Basic",
    price: 49000,
    period: "bulan",
    description: "Untuk pengguna individual",
    icon: Sparkles,
    color: "from-blue-400 to-blue-600",
    features: [
      "100.000 token/bulan",
      "20+ model AI populer",
      "Chat tidak terbatas",
      "5 AI Agent",
      "Upload file 20MB",
      "AI Vision & OCR",
      "Workspace Markdown",
      "Email Support",
    ],
    notIncluded: ["Model premium (GPT-4, Claude Opus)", "AI Image Generation"],
    cta: "Mulai Basic",
    href: "/register?plan=basic",
    popular: false,
  },
  {
    name: "Pro",
    price: 149000,
    period: "bulan",
    description: "Untuk profesional & freelancer",
    icon: Crown,
    color: "from-violet-500 to-purple-600",
    features: [
      "500.000 token/bulan",
      "50+ model AI premium",
      "Chat tidak terbatas",
      "20 AI Agent",
      "Upload file 50MB",
      "AI Image Generation",
      "Voice Chat & STT/TTS",
      "AI Workspace lengkap",
      "Export & Share Chat",
      "Priority Email Support",
    ],
    notIncluded: [],
    cta: "Mulai Pro",
    href: "/register?plan=pro",
    popular: true,
  },
  {
    name: "Premium",
    price: 299000,
    period: "bulan",
    description: "Untuk tim & power users",
    icon: Crown,
    color: "from-amber-500 to-orange-600",
    features: [
      "2.000.000 token/bulan",
      "100+ model AI semua provider",
      "Chat tidak terbatas",
      "Unlimited AI Agent",
      "Upload file 200MB",
      "Semua fitur Pro",
      "API Access",
      "WhatsApp Support",
      "Custom system prompt",
      "Analytics usage detail",
    ],
    notIncluded: [],
    cta: "Mulai Premium",
    href: "/register?plan=premium",
    popular: false,
  },
  {
    name: "Enterprise",
    price: -1,
    period: "",
    description: "Solusi untuk perusahaan",
    icon: Building2,
    color: "from-emerald-500 to-teal-600",
    features: [
      "Token tidak terbatas",
      "Dedicated instance",
      "Custom deployment",
      "SLA 99.9%",
      "Dedicated support",
      "Custom billing",
      "Onboarding & training",
      "GDPR & compliance",
    ],
    notIncluded: [],
    cta: "Hubungi Kami",
    href: "/contact",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 bg-[#050510]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nexus-950/10 to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nexus-500/30 bg-nexus-500/10 text-nexus-400 text-sm mb-4">
            <Crown className="w-4 h-4" />
            Paket Harga
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Harga yang Transparan
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Mulai gratis, upgrade sesuai kebutuhan. Pembayaran via transfer bank manual yang mudah dan aman.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                plan.popular
                  ? "border-nexus-500/50 bg-gradient-to-b from-nexus-500/10 to-purple-500/5 shadow-glow"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-nexus-500 to-purple-600 text-white text-xs font-semibold">
                    Paling Populer
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}
                >
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-white/50">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price === -1 ? (
                  <div className="text-2xl font-bold text-white">Custom</div>
                ) : plan.price === 0 ? (
                  <div>
                    <span className="text-3xl font-bold text-white">Gratis</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-white/40 text-sm">/{plan.period}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <Button
                className={`w-full mb-6 ${
                  plan.popular
                    ? "bg-gradient-to-r from-nexus-500 to-purple-600 text-white hover:shadow-glow"
                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                }`}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>

              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
