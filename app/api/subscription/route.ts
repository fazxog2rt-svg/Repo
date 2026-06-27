import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    const usage = await prisma.usage.aggregate({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { tokensUsed: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        monthlyTokensUsed: usage._sum.tokensUsed || 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data subscription" }, { status: 500 });
  }
}
