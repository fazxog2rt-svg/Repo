import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const agentSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(1).max(10000),
  modelId: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().default(4096),
  topP: z.number().min(0).max(1).default(1),
  presencePenalty: z.number().min(-2).max(2).default(0),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
  isPublic: z.boolean().default(false),
  avatar: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agents = await prisma.agent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: agents });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = agentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const agent = await prisma.agent.create({
    data: { userId: session.user.id, ...parsed.data },
  });
  return NextResponse.json({ success: true, data: agent }, { status: 201 });
}
