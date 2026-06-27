import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { createChatStream } from "@/lib/ai/openrouter";
import { checkRateLimit } from "@/lib/redis";
import { z } from "zod";

const schema = z.object({
  chatId: z.string(),
  content: z.string().min(1).max(32000),
  modelId: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(100000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    // Rate limit
    const rateLimit = await checkRateLimit(
      `chat:${userId}`,
      parseInt(process.env.RATE_LIMIT_CHAT_PER_MINUTE || "30"),
      60
    );
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded. Coba lagi nanti." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { chatId, content, modelId, temperature, maxTokens } = parsed.data;

    // Verify chat ownership
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { agent: true },
    });
    if (!chat) return NextResponse.json({ error: "Chat tidak ditemukan" }, { status: 404 });

    // Get API key
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: { userId, provider: "openrouter", isActive: true },
    });
    if (!apiKeyRecord) {
      return NextResponse.json({ error: "OpenRouter API Key belum dikonfigurasi" }, { status: 400 });
    }

    // Check subscription token limit
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    if (subscription && subscription.tokensUsed >= subscription.tokensLimit) {
      return NextResponse.json({
        error: "Token bulanan habis. Upgrade paket Anda.",
      }, { status: 403 });
    }

    // Get previous messages (last 20 for context)
    const previousMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, content: true },
    });

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        role: "USER",
        content,
      },
    });

    // Build messages array for API
    const messages = [
      ...previousMessages.map((m) => ({
        role: m.role.toLowerCase(),
        content: m.content,
      })),
      { role: "user", content },
    ];

    // Call OpenRouter with streaming
    const streamResponse = await createChatStream({
      messages,
      modelId,
      encryptedApiKey: apiKeyRecord.encryptedKey,
      temperature: temperature ?? chat.temperature,
      maxTokens: maxTokens ?? chat.maxTokens,
      systemPrompt: chat.agent?.systemPrompt || chat.systemPrompt || undefined,
    });

    // Create ReadableStream to pipe and save response
    let assistantContent = "";
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = streamResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  break;
                }
                try {
                  const json = JSON.parse(data);
                  const delta = json.choices?.[0]?.delta?.content || "";
                  assistantContent += delta;
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                } catch {
                  /* skip */
                }
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();

          // Save assistant message
          if (assistantContent) {
            await prisma.message.create({
              data: {
                chatId,
                role: "ASSISTANT",
                content: assistantContent,
                modelId,
              },
            }).catch(console.error);

            // Update chat title if first message
            if (previousMessages.length === 0) {
              await prisma.chat.update({
                where: { id: chatId },
                data: { title: content.slice(0, 60), updatedAt: new Date() },
              }).catch(console.error);
            } else {
              await prisma.chat.update({
                where: { id: chatId },
                data: { updatedAt: new Date() },
              }).catch(console.error);
            }

            // Track usage
            const tokenEstimate = Math.ceil((content.length + assistantContent.length) / 4);
            await prisma.usage.create({
              data: {
                userId,
                modelId,
                feature: "chat",
                tokensUsed: tokenEstimate,
              },
            }).catch(console.error);

            // Update subscription token usage
            if (subscription) {
              await prisma.subscription.update({
                where: { id: subscription.id },
                data: { tokensUsed: { increment: tokenEstimate } },
              }).catch(console.error);
            }
          }
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Chat Stream] Error:", error);
    return NextResponse.json({ error: (error as Error).message || "Terjadi kesalahan" }, { status: 500 });
  }
}
