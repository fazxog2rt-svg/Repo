import Link from "next/link";
import { Key, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoApiKeyBanner() {
  return (
    <div className="mx-4 mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
      <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-400">API Key belum dikonfigurasi</p>
        <p className="text-xs text-amber-400/70 mt-0.5">
          Tambahkan OpenRouter API Key Anda untuk mulai menggunakan AI Chat.
          API Key tersimpan terenkripsi dan aman.
        </p>
      </div>
      <Button size="sm" variant="outline" asChild className="shrink-0 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs">
        <Link href="/api-settings">
          Tambah API Key
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </Button>
    </div>
  );
}
