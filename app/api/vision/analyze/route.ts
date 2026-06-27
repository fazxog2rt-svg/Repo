import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateOk = await checkRateLimit(`vision:${session.user.id}`, 20, 3600);
    if (!rateOk) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const prompt = formData.get("prompt") as string || "Apa yang ada di gambar ini?";

    if (!imageFile) return NextResponse.json({ error: "Gambar diperlukan" }, { status: 400 });

    const apiKey = await prisma.apiKey.findFirst({
      where: { userId: session.user.id, isActive: true },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API Key belum dikonfigurasi. Pergi ke Pengaturan API." }, { status: 400 });
    }

    const decryptedKey = decryptApiKey(apiKey.encryptedKey);

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${imageFile.type};base64,${base64}`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${decryptedKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "NexusAI",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataUrl } },
              { type: "text", text: prompt },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return NextResponse.json({ error: error.error?.message || "Gagal menganalisis gambar" }, { status: res.status });
    }

    const data = await res.json();
    const result = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Vision error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
