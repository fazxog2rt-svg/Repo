import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { SubscriptionPage } from "@/components/dashboard/subscription-page";

export default async function Page() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [plans, subscription, invoices] = await Promise.all([
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { plan: true },
    }),
    prisma.invoice.findMany({
      where: { userId },
      include: { plan: true, paymentProof: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <SubscriptionPage
      plans={plans as never}
      currentSubscription={subscription as never}
      recentInvoices={invoices as never}
    />
  );
}
