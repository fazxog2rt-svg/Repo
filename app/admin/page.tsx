import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const [
    totalUsers,
    activeUsers,
    pendingPayments,
    totalRevenue,
    recentInvoices,
    dailyStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.invoice.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true } },
        paymentProof: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.usage.groupBy({
      by: ["createdAt"],
      _sum: { tokensUsed: true },
      orderBy: { createdAt: "desc" },
      take: 7,
    }),
  ]);

  return (
    <AdminDashboard
      stats={{
        totalUsers,
        activeUsers,
        pendingPayments,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
      }}
      recentInvoices={recentInvoices as never}
    />
  );
}
