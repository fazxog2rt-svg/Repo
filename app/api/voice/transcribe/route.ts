import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) return NextResponse.json({ error: "Audio file diperlukan" }, { status: 400 });

    const apiKey = await prisma.apiKey.findFirst({
      where: { userId: session.user.id, isActive: true },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API Key belum dikonfigurasi" }, { status: 400 });
    }

    const decryptedKey = decryptApiKey(apiKey.encryptedKey);

    // Build multipart form data for OpenAI Whisper via OpenRouter
    const uploadForm = new FormData();
    uploadForm.append("file", audioFile, "recording.webm");
    uploadForm.append("model", "openai/whisper-1");
    uploadForm.append("response_format", "json");
    uploadForm.append("language", "id");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${decryptedKey}` },
      body: uploadForm,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return NextResponse.json({ error: error.error?.message || "Gagal transkripsi" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, text: data.text || "" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal transkripsi audio" }, { status: 500 });
  }
}
