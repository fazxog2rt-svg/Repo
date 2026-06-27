import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { ApiSettingsPage } from "@/components/dashboard/api-settings-page";

export default async function Page() {
  const session = await auth();
  const apiKey = await prisma.apiKey.findFirst({
    where: { userId: session!.user!.id!, provider: "openrouter" },
    select: { id: true, name: true, isActive: true, lastUsedAt: true, createdAt: true },
  });

  return <ApiSettingsPage apiKey={apiKey as never} />;
}
