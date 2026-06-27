import prisma from "@/lib/db";
import { PromptsPage } from "@/components/dashboard/prompts-page";

export default async function Page() {
  const prompts = await prisma.prompt.findMany({
    where: { isPublic: true },
    orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
  });
  return <PromptsPage prompts={prompts as never} />;
}
