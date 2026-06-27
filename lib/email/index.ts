import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "NexusAI <noreply@nexusai.com>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verifikasi Email - NexusAI",
    html: emailTemplate({
      title: "Verifikasi Email Anda",
      content: `
        <p>Terima kasih telah mendaftar di NexusAI!</p>
        <p>Klik tombol di bawah untuk memverifikasi email Anda:</p>
      `,
      buttonText: "Verifikasi Email",
      buttonUrl: url,
    }),
  });
}

export async function sendPaymentApprovedEmail(
  email: string,
  name: string,
  planName: string,
  invoiceNumber: string
) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Pembayaran Disetujui - ${invoiceNumber}`,
    html: emailTemplate({
      title: "Pembayaran Berhasil Diverifikasi! 🎉",
      content: `
        <p>Halo <strong>${name}</strong>,</p>
        <p>Pembayaran Anda untuk paket <strong>${planName}</strong> telah berhasil diverifikasi.</p>
        <p>Nomor Invoice: <strong>${invoiceNumber}</strong></p>
        <p>Akun Anda kini telah aktif dengan akses premium. Nikmati semua fitur NexusAI!</p>
      `,
      buttonText: "Mulai Gunakan NexusAI",
      buttonUrl: `${APP_URL}/chat`,
    }),
  });
}

export async function sendPaymentRejectedEmail(
  email: string,
  name: string,
  invoiceNumber: string,
  reason: string
) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Pembayaran Ditolak - ${invoiceNumber}`,
    html: emailTemplate({
      title: "Pembayaran Ditolak",
      content: `
        <p>Halo <strong>${name}</strong>,</p>
        <p>Maaf, pembayaran Anda dengan nomor invoice <strong>${invoiceNumber}</strong> tidak dapat kami verifikasi.</p>
        <p><strong>Alasan:</strong> ${reason}</p>
        <p>Silakan hubungi tim support kami jika Anda memerlukan bantuan.</p>
      `,
      buttonText: "Hubungi Support",
      buttonUrl: `${APP_URL}/subscription`,
    }),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset Password - NexusAI",
    html: emailTemplate({
      title: "Reset Password",
      content: `
        <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
        <p>Klik tombol di bawah untuk membuat password baru. Link ini valid selama 1 jam.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      `,
      buttonText: "Reset Password",
      buttonUrl: url,
    }),
  });
}

function emailTemplate({
  title,
  content,
  buttonText,
  buttonUrl,
}: {
  title: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:40px auto;padding:0 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#5668ff,#764ba2);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:20px;font-weight:bold;">N</span>
        </div>
        <span style="color:white;font-size:24px;font-weight:700;">NexusAI</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;">
      <h1 style="color:white;font-size:24px;font-weight:700;margin:0 0 24px;">${title}</h1>
      <div style="color:#a0a0b8;font-size:16px;line-height:1.6;">${content}</div>

      <!-- Button -->
      <div style="text-align:center;margin-top:32px;">
        <a href="${buttonUrl}" style="display:inline-block;background:linear-gradient(135deg,#5668ff,#764ba2);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:16px;">
          ${buttonText}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;color:#666;font-size:14px;">
      <p>© ${new Date().getFullYear()} NexusAI. All rights reserved.</p>
      <p>Jika Anda tidak membuat akun di NexusAI, abaikan email ini.</p>
    </div>
  </div>
</body>
</html>`;
}
