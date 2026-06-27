import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const internalKey = req.headers.get("x-internal-key");
  if (internalKey !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { invoiceId, invoiceNumber, senderName, senderBank, amount, imageBase64, whatsappPhone } =
      await req.json();

    // Save image to disk
    let imageUrl: string | null = null;
    if (imageBase64) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
      fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `proof-${invoiceNumber}-${Date.now()}.jpg`;
      fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(imageBase64, "base64"));
      imageUrl = `/uploads/proofs/${filename}`;
    }

    await prisma.paymentProof.create({
      data: {
        invoiceId,
        senderName,
        senderBank,
        amount,
        imageUrl,
      },
    });

    // Notify admin via notification
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true, plan: true },
    });

    if (invoice) {
      await prisma.notification.create({
        data: {
          userId: invoice.userId,
          type: "PAYMENT",
          title: "Bukti Transfer Diterima",
          message: `Bukti transfer untuk invoice ${invoiceNumber} telah diterima. Menunggu verifikasi admin.`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Submit Proof] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
