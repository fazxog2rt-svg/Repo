"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-24 bg-[#050510] overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[300px] bg-nexus-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Siap Mulai dengan
            <br />
            <span className="bg-gradient-to-r from-nexus-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              NexusAI?
            </span>
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Daftar gratis sekarang. Tidak perlu kartu kredit. Mulai dengan 10.000 token gratis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="gradient" asChild className="gap-2 shine">
              <Link href="/register">
                <Sparkles className="w-5 h-5" />
                Mulai Gratis Sekarang
              </Link>
            </Button>
            <Button
              size="xl"
              asChild
              className="gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10"
            >
              <Link href="/login">
                Sudah punya akun?
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
