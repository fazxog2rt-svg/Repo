import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await params;

  const file = await prisma.file.findFirst({ where: { id: fileId, userId: session.user.id } });
  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });

  try {
    await unlink(join(process.cwd(), "public", file.url));
  } catch { /* File already deleted */ }

  await prisma.file.delete({ where: { id: fileId } });
  return NextResponse.json({ success: true });
}
