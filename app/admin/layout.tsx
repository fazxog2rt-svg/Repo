import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { AdminLayout } from "@/components/admin/admin-layout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/chat");
  }

  return <AdminLayout user={session.user}>{children}</AdminLayout>;
}
