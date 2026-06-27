"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ahmad Fauzi",
    role: "Software Engineer",
    company: "Startup Fintech",
    avatar: "AF",
    rating: 5,
    text: "NexusAI mengubah cara saya bekerja. Bisa akses Claude, GPT-4, dan DeepSeek dalam satu tempat dengan API Key sendiri. Hemat biaya dan sangat efisien!",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Sarah Putri",
    role: "Content Writer",
    company: "Digital Agency",
    avatar: "SP",
    rating: 5,
    text: "Prompt Library dan fitur rewrite/grammar check sangat membantu pekerjaan saya. UI-nya cantik, mudah digunakan, dan response AI-nya cepat.",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Budi Santoso",
    role: "Marketing Manager",
    company: "E-commerce",
    avatar: "BS",
    rating: 5,
    text: "Fitur AI Workspace seperti Notion tapi dengan AI terintegrasi langsung. Tim kami sekarang bisa brainstorm dan buat konten 3x lebih cepat.",
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Dewi Rahayu",
    role: "Data Analyst",
    company: "Konsultan IT",
    avatar: "DR",
    rating: 5,
    text: "SQL Generator dan PDF Reader sangat berguna untuk pekerjaan analisis data saya. Sistem pembayaran via transfer bank juga sangat memudahkan.",
    color: "from-teal-500 to-green-500",
  },
  {
    name: "Rizky Pratama",
    role: "Freelancer",
    company: "Fullstack Developer",
    avatar: "RP",
    rating: 5,
    text: "Sebagai freelancer, akses ke semua model AI dengan harga terjangkau sangat membantu. Paket Pro worth it banget! Customer support via WhatsApp juga responsif.",
    color: "from-rose-500 to-red-500",
  },
  {
    name: "Nila Sari",
    role: "UX Designer",
    company: "Product Studio",
    avatar: "NS",
    rating: 5,
    text: "AI Vision dan kemampuan analisis gambar di NexusAI sangat membantu dalam pekerjaan desain saya. Interface-nya pun sangat premium dan nyaman.",
    color: "from-indigo-500 to-violet-500",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 bg-[#050510] overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nexus-500/30 bg-nexus-500/10 text-nexus-400 text-sm mb-4">
            <Star className="w-4 h-4" />
            Testimoni
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Dipercaya Ribuan Pengguna
          </h2>
          <p className="text-white/50 text-lg">
            Bergabunglah dengan 50.000+ pengguna yang sudah merasakan manfaat NexusAI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-2xl p-6 border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-white/10 mb-4" />
              <p className="text-white/70 text-sm leading-relaxed mb-6">{t.text}</p>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-white/40">{t.role} · {t.company}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
