import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text, voice = "nova", speed = 1.0 } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Teks diperlukan" }, { status: 400 });
    }
    if (text.length > 4096) {
      return NextResponse.json({ error: "Teks terlalu panjang (maks 4096 karakter)" }, { status: 400 });
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: { userId: session.user.id, isActive: true },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API Key belum dikonfigurasi" }, { status: 400 });
    }

    const decryptedKey = decryptApiKey(apiKey.encryptedKey);

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${decryptedKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice,
        speed,
        response_format: "mp3",
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return NextResponse.json({ error: error.error?.message || "Gagal membuat suara" }, { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="speech.mp3"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal text-to-speech" }, { status: 500 });
  }
}
