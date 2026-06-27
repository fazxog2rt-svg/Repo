import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const prompts = await prisma.prompt.findMany({
    where: {
      OR: [{ isPublic: true }, { userId: session.user.id }],
      ...(category && category !== "all" ? { category } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ]
      } : {}),
    },
    orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ success: true, data: prompts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const prompt = await prisma.prompt.create({
    data: { userId: session.user.id, ...body },
  });
  return NextResponse.json({ success: true, data: prompt }, { status: 201 });
}
