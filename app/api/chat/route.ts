import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  modelId: z.string(),
  folderId: z.string().optional(),
  agentId: z.string().optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(100000).optional(),
});

// GET /api/chat - List user's chats
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const archived = searchParams.get("archived") === "true";

    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id, isArchived: archived },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        modelId: true,
        isPinned: true,
        isArchived: true,
        isShared: true,
        shareToken: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ success: true, data: chats });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil chat" }, { status: 500 });
  }
}

// POST /api/chat - Create new chat
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const chat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ success: true, data: chat }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat chat" }, { status: 500 });
  }
}
