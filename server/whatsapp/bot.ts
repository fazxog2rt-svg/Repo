/**
 * NexusAI WhatsApp Bot - Powered by Baileys
 * Handles payment verification, notifications, and user support
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeInMemoryStore,
  proto,
  MessageType,
  downloadMediaMessage,
} from "baileys";
import { Boom } from "@hapi/boom";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";

const SESSION_PATH = process.env.WA_SESSION_PATH || "./wa-session";
const ADMIN_PHONES = [
  process.env.WA_ADMIN_PHONE,
  process.env.WA_ADMIN_PHONE2,
].filter(Boolean) as string[];

// In-memory pending verifications
const pendingVerifications = new Map<
  string,
  {
    invoiceId: string;
    invoiceNumber: string;
    step: "waiting_sender" | "waiting_bank" | "waiting_proof";
    senderName?: string;
    senderBank?: string;
    amount: number;
    planName: string;
    userName: string;
    userEmail: string;
  }
>();

let sock: ReturnType<typeof makeWASocket> | null = null;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

  sock = makeWASocket({
    printQRInTerminal: false,
    auth: state,
    logger: { level: "silent" } as never,
    browser: ["NexusAI Bot", "Chrome", "1.0.0"],
  });

  // QR Code
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("[WhatsApp Bot] QR Code received. Scan to connect:");
      const qrTerminal = await QRCode.toString(qr, { type: "terminal", small: true });
      console.log(qrTerminal);

      // Save QR for web display
      const qrImage = await QRCode.toDataURL(qr);
      fs.writeFileSync(path.join(SESSION_PATH, "qr.txt"), qrImage);

      // Notify via API
      try {
        await fetch(`${process.env.APP_URL}/api/whatsapp/qr`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-internal-key": process.env.NEXTAUTH_SECRET || "" },
          body: JSON.stringify({ qr: qrImage }),
        });
      } catch {
        /* ignore */
      }
    }

    if (connection === "close") {
      const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log("[WhatsApp Bot] Connection closed. Reconnecting:", shouldReconnect);
      if (shouldReconnect) {
        setTimeout(startBot, 3000);
      }
    } else if (connection === "open") {
      console.log("[WhatsApp Bot] ✅ Connected!");
      notifyAdmins("🤖 NexusAI WhatsApp Bot aktif dan siap menerima konfirmasi pembayaran.");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // Message handler
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      await handleMessage(msg);
    }
  });
}

async function handleMessage(msg: proto.IWebMessageInfo) {
  const from = msg.key.remoteJid!;
  const body = extractMessageText(msg);
  const isAdmin = ADMIN_PHONES.some((p) => from.includes(p));

  if (!body) return;

  const bodyLower = body.toLowerCase().trim();
  const phone = from.replace("@s.whatsapp.net", "");

  // ============================================================
  // PAYMENT VERIFICATION FLOW
  // ============================================================

  if (bodyLower.includes("verifikasi pembayaran") || bodyLower.includes("invoice:")) {
    // Parse invoice number from message
    const invoiceMatch = body.match(/Invoice:\s*([A-Z0-9-]+)/i);
    const invoiceNumber = invoiceMatch?.[1];

    if (!invoiceNumber) {
      await sendMessage(
        from,
        "❌ Format tidak valid. Gunakan format:\n\nHalo, saya ingin melakukan verifikasi pembayaran.\nInvoice: INV-XXXXXX-XXXXXX\nNama: [Nama]\nEmail: [Email]\nNominal: [Nominal]"
      );
      return;
    }

    // Fetch invoice from database
    try {
      const res = await fetch(`${process.env.APP_URL}/api/whatsapp/verify-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": process.env.NEXTAUTH_SECRET || "",
        },
        body: JSON.stringify({ invoiceNumber, whatsappPhone: phone }),
      });

      const data = await res.json();

      if (!res.ok || !data.invoice) {
        await sendMessage(from, `❌ Invoice ${invoiceNumber} tidak ditemukan atau sudah kadaluwarsa.`);
        return;
      }

      const { invoice } = data;

      // Store pending verification
      pendingVerifications.set(phone, {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        step: "waiting_sender",
        amount: invoice.amount,
        planName: invoice.planName,
        userName: invoice.userName,
        userEmail: invoice.userEmail,
      });

      await sendMessage(
        from,
        `✅ Invoice ditemukan!\n\n📋 *Detail Invoice*\nInvoice: ${invoice.invoiceNumber}\nPaket: ${invoice.planName}\nNominal: Rp ${Number(invoice.amount).toLocaleString("id-ID")}\n\nSilakan kirim *nama pengirim transfer* Anda:`
      );
    } catch (err) {
      console.error("[WhatsApp] Invoice lookup error:", err);
      await sendMessage(from, "❌ Terjadi kesalahan. Coba lagi nanti.");
    }
    return;
  }

  // Check if user is in verification flow
  const pending = pendingVerifications.get(phone);
  if (pending) {
    switch (pending.step) {
      case "waiting_sender":
        pending.senderName = body.trim();
        pending.step = "waiting_bank";
        pendingVerifications.set(phone, pending);
        await sendMessage(from, `✅ Nama pengirim: *${body.trim()}*\n\nSekarang kirim *nama bank* yang Anda gunakan untuk transfer:`);
        return;

      case "waiting_bank":
        pending.senderBank = body.trim();
        pending.step = "waiting_proof";
        pendingVerifications.set(phone, pending);
        await sendMessage(from, `✅ Bank: *${body.trim()}*\n\nTerakhir, kirim *foto bukti transfer* Anda (screenshot/foto nota):`);
        return;

      case "waiting_proof":
        // Handle image
        if (msg.message?.imageMessage) {
          const imageBuffer = await downloadMediaMessage(msg, "buffer", {});
          const base64 = (imageBuffer as Buffer).toString("base64");

          // Submit to backend
          try {
            const res = await fetch(`${process.env.APP_URL}/api/whatsapp/submit-proof`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-internal-key": process.env.NEXTAUTH_SECRET || "",
              },
              body: JSON.stringify({
                invoiceId: pending.invoiceId,
                invoiceNumber: pending.invoiceNumber,
                senderName: pending.senderName,
                senderBank: pending.senderBank,
                amount: pending.amount,
                imageBase64: base64,
                whatsappPhone: phone,
              }),
            });

            if (res.ok) {
              await sendMessage(
                from,
                `✅ *Bukti transfer diterima!*\n\nData Anda:\n• Invoice: ${pending.invoiceNumber}\n• Pengirim: ${pending.senderName}\n• Bank: ${pending.senderBank}\n• Nominal: Rp ${Number(pending.amount).toLocaleString("id-ID")}\n\n⏳ Tim admin akan memverifikasi pembayaran Anda dalam 1-24 jam kerja. Kami akan mengirim notifikasi setelah verified.\n\nTerima kasih! 🙏`
              );

              // Notify admins
              const adminMsg = `🔔 *Pembayaran Baru Menunggu Verifikasi*\n\nInvoice: ${pending.invoiceNumber}\nUser: ${pending.userName} (${pending.userEmail})\nPaket: ${pending.planName}\nNominal: Rp ${Number(pending.amount).toLocaleString("id-ID")}\nPengirim: ${pending.senderName}\nBank: ${pending.senderBank}\n\nBuka Admin Panel untuk approve/reject.`;
              notifyAdmins(adminMsg);
            } else {
              await sendMessage(from, "❌ Gagal mengirim bukti. Coba kirim ulang foto.");
              return;
            }
          } catch (err) {
            await sendMessage(from, "❌ Terjadi kesalahan. Coba lagi.");
            return;
          }

          pendingVerifications.delete(phone);
        } else {
          await sendMessage(from, "⚠️ Mohon kirim foto/screenshot bukti transfer, bukan teks.");
        }
        return;
    }
  }

  // ============================================================
  // ADMIN COMMANDS
  // ============================================================

  if (isAdmin && bodyLower.startsWith("/")) {
    const [cmd, ...args] = bodyLower.split(" ");

    switch (cmd) {
      case "/status":
        await sendMessage(from, `🤖 *NexusAI Bot Status*\nStatus: Online ✅\nPending: ${pendingVerifications.size} verifikasi`);
        break;
      case "/broadcast":
        await sendMessage(from, "📢 Fitur broadcast tersedia via Admin Panel.");
        break;
      default:
        await sendMessage(from, `❓ Perintah tidak dikenali: ${cmd}`);
    }
    return;
  }

  // ============================================================
  // DEFAULT REPLY
  // ============================================================

  if (!pending) {
    await sendMessage(
      from,
      `👋 Halo! Saya adalah bot NexusAI.\n\nUntuk verifikasi pembayaran, ketik:\n\n_Halo, saya ingin melakukan verifikasi pembayaran.\nInvoice: [Nomor Invoice Anda]_\n\nAtau hubungi support kami melalui website.`
    );
  }
}

function extractMessageText(msg: proto.IWebMessageInfo): string {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    ""
  );
}

async function sendMessage(jid: string, text: string) {
  if (!sock) return;
  await sock.sendMessage(jid, { text });
}

async function notifyAdmins(text: string) {
  for (const phone of ADMIN_PHONES) {
    try {
      await sendMessage(`${phone}@s.whatsapp.net`, text);
    } catch {
      /* skip */
    }
  }
}

export async function sendPaymentApprovedWA(phone: string, planName: string, invoiceNumber: string) {
  if (!sock || !phone) return;
  const jid = `${phone.replace(/[^0-9]/g, "")}@s.whatsapp.net`;
  await sendMessage(
    jid,
    `🎉 *Pembayaran Dikonfirmasi!*\n\nHalo! Pembayaran Anda untuk paket *${planName}* dengan invoice ${invoiceNumber} telah berhasil diverifikasi.\n\nAkun premium Anda kini aktif. Silakan login di nexusai.com\n\nTerima kasih telah menggunakan NexusAI! 🚀`
  );
}

export async function sendPaymentRejectedWA(phone: string, invoiceNumber: string, reason: string) {
  if (!sock || !phone) return;
  const jid = `${phone.replace(/[^0-9]/g, "")}@s.whatsapp.net`;
  await sendMessage(
    jid,
    `❌ *Pembayaran Ditolak*\n\nMaaf, pembayaran dengan invoice ${invoiceNumber} tidak dapat diverifikasi.\n\nAlasan: ${reason}\n\nJika ada pertanyaan, balas pesan ini atau hubungi support kami.`
  );
}

// Start bot
startBot().catch(console.error);
console.log("[WhatsApp Bot] Starting...");
