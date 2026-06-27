"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Apa itu OpenRouter API Key dan mengapa saya perlu menyediakannya sendiri?",
    a: "OpenRouter adalah platform agregator AI yang memungkinkan Anda mengakses 100+ model AI dari berbagai provider. Dengan menggunakan API Key Anda sendiri, Anda memiliki kontrol penuh atas penggunaan dan biaya. API Key Anda dienkripsi dengan AES-256 dan tidak pernah diekspos ke frontend.",
  },
  {
    q: "Bagaimana cara mendapatkan OpenRouter API Key?",
    a: "Daftar di openrouter.ai, buat akun gratis, lalu generate API Key di dashboard. Isi saldo (credit) sesuai kebutuhan. NexusAI hanya menggunakan API Key Anda untuk mengirim permintaan ke model yang Anda pilih.",
  },
  {
    q: "Bagaimana sistem pembayaran bekerja?",
    a: "NexusAI menggunakan sistem transfer bank manual. Pilih paket, sistem akan membuat invoice dengan detail rekening. Setelah transfer, konfirmasi via WhatsApp bot kami. Admin akan memverifikasi dan mengaktifkan langganan Anda dalam waktu singkat.",
  },
  {
    q: "Apakah data chat saya aman dan privat?",
    a: "Ya. Chat Anda dienkripsi dan disimpan secara aman. Kami tidak menjual atau membagikan data Anda ke pihak ketiga. API Key OpenRouter Anda dienkripsi dengan AES-256 di server dan tidak pernah dikirim ke frontend.",
  },
  {
    q: "Apakah semua model AI langsung tersedia tanpa update kode?",
    a: "Ya! NexusAI mengambil daftar model langsung dari OpenRouter API secara real-time. Setiap model baru yang ditambahkan OpenRouter akan otomatis muncul di NexusAI tanpa perlu update apapun.",
  },
  {
    q: "Apa perbedaan token dengan kredit OpenRouter?",
    a: "Token di NexusAI adalah kuota penggunaan platform kami (seperti fitur-fitur premium). Kredit OpenRouter adalah biaya API yang Anda bayar langsung ke OpenRouter untuk penggunaan model AI. Keduanya terpisah - NexusAI tidak mengambil margin dari penggunaan API Anda.",
  },
  {
    q: "Apakah ada masa percobaan atau garansi uang kembali?",
    a: "Kami menyediakan paket Free yang bisa digunakan selamanya tanpa biaya. Untuk paket berbayar, jika ada masalah teknis serius yang tidak dapat kami selesaikan dalam 7 hari, kami akan memberikan refund penuh.",
  },
  {
    q: "Bisakah saya downgrade atau cancel langganan?",
    a: "Ya, Anda bisa cancel kapan saja. Langganan akan aktif sampai periode berakhir. Downgrade dapat dilakukan di halaman Subscription.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 bg-[#050510]">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nexus-500/30 bg-nexus-500/10 text-nexus-400 text-sm mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Pertanyaan Umum
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-medium text-white text-sm md:text-base">{faq.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
