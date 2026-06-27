import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { FileType } from "@prisma/client";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES: Record<string, FileType> = {
  "application/pdf": FileType.PDF,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileType.DOCX,
  "application/msword": FileType.DOCX,
  "application/vnd.ms-excel": FileType.XLSX,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileType.XLSX,
  "text/plain": FileType.TXT,
  "text/csv": FileType.CSV,
  "image/png": FileType.PNG,
  "image/jpeg": FileType.JPG,
  "image/webp": FileType.PNG,
  "image/gif": FileType.PNG,
  "audio/mpeg": FileType.MP3,
  "audio/wav": FileType.MP3,
  "audio/webm": FileType.MP3,
  "video/mp4": FileType.MP4,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Ukuran file terlalu besar (maks 50MB)" }, { status: 400 });

    const fileType = ALLOWED_TYPES[file.type];
    if (!fileType) return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 });

    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${randomUUID()}.${ext}`;

    await mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(UPLOAD_DIR, fileName), buffer);

    const fileRecord = await prisma.file.create({
      data: {
        userId: session.user.id,
        name: fileName,
        originalName: file.name,
        url: `/uploads/${fileName}`,
        size: file.size,
        mimeType: file.type,
        fileType,
      },
    });

    return NextResponse.json({ success: true, data: fileRecord }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 });
  }
}
