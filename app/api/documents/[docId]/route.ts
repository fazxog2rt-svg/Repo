import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { docId } = await params;
  const body = await req.json();
  const { title, content } = body;

  const doc = await prisma.document.findFirst({ where: { id: docId, userId: session.user.id } });
  if (!doc) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });

  const updated = await prisma.document.update({
    where: { id: docId },
    data: {
      ...(title && { title }),
      ...(content !== undefined && { content }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { docId } = await params;

  const doc = await prisma.document.findFirst({ where: { id: docId, userId: session.user.id } });
  if (!doc) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });

  await prisma.document.delete({ where: { id: docId } });
  return NextResponse.json({ success: true });
}
