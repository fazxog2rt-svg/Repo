import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatId } = await params;

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId: session.user.id },
    });
    if (!chat) return NextResponse.json({ error: "Chat tidak ditemukan" }, { status: 404 });

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil pesan" }, { status: 500 });
  }
}
