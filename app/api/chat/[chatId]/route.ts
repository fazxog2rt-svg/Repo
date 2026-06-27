import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!chat) return NextResponse.json({ error: "Chat tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ success: true, data: chat });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;
  const body = await req.json();
  const { title, isPinned, isArchived } = body;

  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId: session.user.id } });
  if (!chat) return NextResponse.json({ error: "Chat tidak ditemukan" }, { status: 404 });

  const updated = await prisma.chat.update({
    where: { id: chatId },
    data: {
      ...(title && { title }),
      ...(isPinned !== undefined && { isPinned }),
      ...(isArchived !== undefined && { isArchived }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;
  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId: session.user.id } });
  if (!chat) return NextResponse.json({ error: "Chat tidak ditemukan" }, { status: 404 });

  await prisma.chat.delete({ where: { id: chatId } });
  return NextResponse.json({ success: true });
}
