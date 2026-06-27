import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(1).max(10000).optional(),
  modelId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().optional(),
  topP: z.number().min(0).max(1).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  isPublic: z.boolean().optional(),
  avatar: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId } = await params;
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
  });
  if (!agent) return NextResponse.json({ error: "Agent tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ success: true, data: agent });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId } = await params;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, userId: session.user.id } });
  if (!agent) return NextResponse.json({ error: "Agent tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const updated = await prisma.agent.update({ where: { id: agentId }, data: parsed.data });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId } = await params;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, userId: session.user.id } });
  if (!agent) return NextResponse.json({ error: "Agent tidak ditemukan" }, { status: 404 });

  await prisma.agent.delete({ where: { id: agentId } });
  return NextResponse.json({ success: true });
}
