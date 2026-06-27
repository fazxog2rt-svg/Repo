import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true, role: true,
      phone: true, bio: true, language: true, timezone: true,
      createdAt: true,
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        take: 1,
      },
    },
  });

  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, bio, language, timezone } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(bio !== undefined && { bio }),
      ...(language && { language }),
      ...(timezone && { timezone }),
    },
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json({ success: true, data: user });
}
