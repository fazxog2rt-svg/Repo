import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { encryptApiKey, decryptApiKey } from "@/lib/crypto";
import { z } from "zod";

const schema = z.object({
  apiKey: z.string().min(1),
  name: z.string().optional(),
  provider: z.string().default("openrouter"),
});

// GET - Check if API key exists
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const key = await prisma.apiKey.findFirst({
      where: { userId: session.user.id, provider: "openrouter" },
      select: { id: true, name: true, provider: true, isActive: true, lastUsedAt: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: key });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil API Key" }, { status: 500 });
  }
}

// POST - Save API key (encrypted)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

    const { apiKey, name, provider } = parsed.data;

    // Validate the key by calling OpenRouter
    const testRes = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!testRes.ok) {
      return NextResponse.json({ error: "API Key tidak valid. Periksa kembali API Key Anda." }, { status: 400 });
    }

    const encrypted = encryptApiKey(apiKey);

    // Upsert API key
    const saved = await prisma.apiKey.upsert({
      where: { userId_provider: { userId: session.user.id, provider } },
      update: { encryptedKey: encrypted, name: name || "OpenRouter Key", isActive: true },
      create: {
        userId: session.user.id,
        name: name || "OpenRouter Key",
        encryptedKey: encrypted,
        provider,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: saved.id, name: saved.name, provider: saved.provider },
    });
  } catch (error) {
    console.error("[API Key Save] Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan API Key" }, { status: 500 });
  }
}

// DELETE - Remove API key
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.apiKey.updateMany({
      where: { userId: session.user.id, provider: "openrouter" },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus API Key" }, { status: 500 });
  }
}
