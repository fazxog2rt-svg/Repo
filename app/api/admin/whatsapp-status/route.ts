import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

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

  // Read QR code file if exists (written by bot process)
  const qrPath = path.join(process.cwd(), "wa-session", "qr-code.txt");
  const statusPath = path.join(process.cwd(), "wa-session", "status.json");

  let qrCode: string | null = null;
  let status = { connected: false, phone: null as string | null, lastSeen: null as string | null };

  try {
    if (fs.existsSync(qrPath)) {
      qrCode = fs.readFileSync(qrPath, "utf-8").trim();
    }
  } catch {
    // ignore
  }

  try {
    if (fs.existsSync(statusPath)) {
      status = JSON.parse(fs.readFileSync(statusPath, "utf-8"));
    }
  } catch {
    // ignore
  }

  return NextResponse.json({ success: true, data: { qrCode, ...status } });
}
