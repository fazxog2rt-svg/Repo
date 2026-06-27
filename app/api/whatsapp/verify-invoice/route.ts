import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const internalKey = req.headers.get("x-internal-key");
  if (internalKey !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { invoiceNumber, whatsappPhone } = await req.json();

    const invoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber,
        status: "PENDING",
        expiredAt: { gt: new Date() },
      },
      include: {
        plan: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Update invoice with WhatsApp phone
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { whatsappPhone },
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        planName: invoice.plan.name,
        userName: invoice.user.name || "Pengguna",
        userEmail: invoice.user.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
