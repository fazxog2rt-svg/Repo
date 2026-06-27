import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, data: documents });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, content } = body;

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: "Judul diperlukan" }, { status: 400 });
  }

  const document = await prisma.document.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      content: content || "",
    },
  });

  return NextResponse.json({ success: true, data: document }, { status: 201 });
}
