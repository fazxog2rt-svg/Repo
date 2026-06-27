import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  planId: z.string(),
  whatsappPhone: z.string().optional(),
});

// POST - Create invoice
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

    const { planId, whatsappPhone } = parsed.data;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    }

    // Cancel any existing pending invoices for this user+plan
    await prisma.invoice.updateMany({
      where: { userId: session.user.id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });

    const expireMinutes = parseInt(process.env.INVOICE_EXPIRE_MINUTES || "30");
    const expiredAt = new Date(Date.now() + expireMinutes * 60 * 1000);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        userId: session.user.id,
        planId,
        amount: plan.price,
        currency: "IDR",
        status: "PENDING",
        bankName: process.env.BANK_NAME || "Bank Central Asia (BCA)",
        bankAccount: process.env.BANK_ACCOUNT || "1234567890",
        bankOwner: process.env.BANK_OWNER || "PT Nexus AI Indonesia",
        expiredAt,
        whatsappPhone,
      },
      include: { plan: true, user: { select: { name: true, email: true } } },
    });

    // Send notification to user
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "PAYMENT",
        title: "Invoice Dibuat",
        message: `Invoice ${invoice.invoiceNumber} untuk paket ${plan.name} telah dibuat. Selesaikan pembayaran sebelum ${expiredAt.toLocaleString("id-ID")}.`,
      },
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error("[Invoice Create] Error:", error);
    return NextResponse.json({ error: "Gagal membuat invoice" }, { status: 500 });
  }
}

// GET - Get user's invoices
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      include: { plan: true, paymentProof: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil invoice" }, { status: 500 });
  }
}
