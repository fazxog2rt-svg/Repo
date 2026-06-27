import { auth } from "@/lib/auth/config";
import { ChatInterface } from "@/components/chat/chat-interface";
import prisma from "@/lib/db";

export default async function ChatPage() {
  const session = await auth();

  // Get user's API key status
  const apiKey = await prisma.apiKey.findFirst({
    where: { userId: session!.user!.id!, provider: "openrouter", isActive: true },
    select: { id: true },
  });

  return (
    <ChatInterface
      userId={session!.user!.id!}
      hasApiKey={!!apiKey}
    />
  );
}
