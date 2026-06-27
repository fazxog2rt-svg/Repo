import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    pendingPayments,
    totalRevenue,
    revenueThisMonth,
    totalMessages,
    messagesThisWeek,
    dailyUsage,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.message.count({ where: { role: "USER" } }),
    prisma.message.count({ where: { role: "USER", createdAt: { gte: sevenDaysAgo } } }),
    prisma.usage.groupBy({
      by: ["createdAt"],
      _sum: { tokensUsed: true, cost: true },
      orderBy: { createdAt: "desc" },
      take: 7,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      users: { total: totalUsers, newThisMonth: newUsersThisMonth },
      subscriptions: { active: activeSubscriptions },
      payments: {
        pending: pendingPayments,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        revenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
      },
      messages: { total: totalMessages, thisWeek: messagesThisWeek },
      dailyUsage,
    },
  });
}
