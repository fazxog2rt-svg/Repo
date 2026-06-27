import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateOk = await checkRateLimit(`image:${session.user.id}`, 10, 3600);
    if (!rateOk) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { prompt, size = "1024x1024", model = "openai/dall-e-3" } = await req.json();

    if (!prompt) return NextResponse.json({ error: "Prompt diperlukan" }, { status: 400 });

    const apiKey = await prisma.apiKey.findFirst({
      where: { userId: session.user.id, isActive: true },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API Key belum dikonfigurasi. Pergi ke Pengaturan API." }, { status: 400 });
    }

    const decryptedKey = decryptApiKey(apiKey.encryptedKey);
    const [width, height] = size.split("x").map(Number);

    const res = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${decryptedKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "NexusAI",
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size,
        response_format: "url",
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return NextResponse.json({ error: error.error?.message || "Gagal menghasilkan gambar" }, { status: res.status });
    }

    const data = await res.json();
    const url = data.data?.[0]?.url;

    if (!url) return NextResponse.json({ error: "Tidak ada URL gambar yang dihasilkan" }, { status: 500 });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat menghasilkan gambar" }, { status: 500 });
  }
}
