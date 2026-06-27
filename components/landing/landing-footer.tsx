import Link from "next/link";
import { Zap, Github, Twitter, Mail } from "lucide-react";

const footerLinks = {
  Produk: [
    { label: "AI Chat", href: "/chat" },
    { label: "AI Image", href: "/image" },
    { label: "AI Vision", href: "/vision" },
    { label: "AI Voice", href: "/voice" },
    { label: "AI Workspace", href: "/workspace" },
    { label: "Prompt Library", href: "/prompts" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Karier", href: "/careers" },
    { label: "Kontak", href: "/contact" },
  ],
  Legal: [
    { label: "Syarat & Ketentuan", href: "/terms" },
    { label: "Kebijakan Privasi", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
  Dukungan: [
    { label: "Dokumentasi", href: "/docs" },
    { label: "Status", href: "/status" },
    { label: "WhatsApp Support", href: "https://wa.me/your-number" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#030308] py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Nexus<span className="text-nexus-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Platform AI SaaS premium dengan akses ke 100+ model AI terbaru.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="mailto:support@nexusai.com" className="text-white/30 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} NexusAI. All rights reserved.
          </p>
          <p className="text-sm text-white/20">
            Made with ❤️ in Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
