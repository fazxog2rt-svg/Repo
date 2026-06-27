import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { sendPaymentApprovedEmail, sendPaymentRejectedEmail } from "@/lib/email";
import { z } from "zod";

const actionSchema = z.object({
  invoiceId: z.string(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

// GET - List all invoices (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = status ? { status: status as "PENDING" | "PAID" | "EXPIRED" | "REJECTED" | "CANCELLED" } : {};

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          plan: { select: { name: true, price: true } },
          paymentProof: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data payment" }, { status: 500 });
  }
}

// PATCH - Approve or reject payment
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!adminUser || (adminUser.role !== "ADMIN" && adminUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

    const { invoiceId, action, reason } = parsed.data;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { plan: true, user: true },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    if (invoice.status !== "PENDING") {
      return NextResponse.json({ error: "Invoice sudah diproses" }, { status: 400 });
    }

    if (action === "approve") {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      await prisma.$transaction([
        // Update invoice
        prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "PAID", paidAt: now, approvedAt: now },
        }),
        // Cancel old subscription
        prisma.subscription.updateMany({
          where: { userId: invoice.userId, status: "ACTIVE" },
          data: { status: "CANCELLED", cancelledAt: now },
        }),
        // Create new subscription
        prisma.subscription.create({
          data: {
            userId: invoice.userId,
            planId: invoice.planId,
            status: "ACTIVE",
            startDate: now,
            endDate,
            tokensLimit: invoice.plan.monthlyTokens,
            tokensUsed: 0,
          },
        }),
        // Notification
        prisma.notification.create({
          data: {
            userId: invoice.userId,
            type: "PAYMENT",
            title: "Pembayaran Disetujui! 🎉",
            message: `Pembayaran untuk paket ${invoice.plan.name} berhasil diverifikasi. Akun premium Anda kini aktif!`,
          },
        }),
        // Admin log
        prisma.adminLog.create({
          data: {
            adminId: session.user.id,
            targetId: invoice.userId,
            action: "PAYMENT_APPROVED",
            details: { invoiceId, planName: invoice.plan.name },
          },
        }),
      ]);

      // Send email
      if (invoice.user.email) {
        await sendPaymentApprovedEmail(
          invoice.user.email,
          invoice.user.name || "Pengguna",
          invoice.plan.name,
          invoice.invoiceNumber
        ).catch(console.error);
      }

      return NextResponse.json({ success: true, message: "Pembayaran disetujui" });
    } else {
      await prisma.$transaction([
        prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "REJECTED", rejectedAt: new Date(), rejectionNote: reason },
        }),
        prisma.notification.create({
          data: {
            userId: invoice.userId,
            type: "PAYMENT",
            title: "Pembayaran Ditolak",
            message: `Pembayaran untuk invoice ${invoice.invoiceNumber} ditolak. Alasan: ${reason || "Tidak ada keterangan"}.`,
          },
        }),
        prisma.adminLog.create({
          data: {
            adminId: session.user.id,
            targetId: invoice.userId,
            action: "PAYMENT_REJECTED",
            details: { invoiceId, reason },
          },
        }),
      ]);

      if (invoice.user.email) {
        await sendPaymentRejectedEmail(
          invoice.user.email,
          invoice.user.name || "Pengguna",
          invoice.invoiceNumber,
          reason || "Tidak ada keterangan"
        ).catch(console.error);
      }

      return NextResponse.json({ success: true, message: "Pembayaran ditolak" });
    }
  } catch (error) {
    console.error("[Admin Payment] Error:", error);
    return NextResponse.json({ error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}
