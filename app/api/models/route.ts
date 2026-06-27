import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { fetchOpenRouterModels } from "@/lib/ai/openrouter";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const models = await fetchOpenRouterModels();
    return NextResponse.json({ success: true, data: models });
  } catch (error) {
    console.error("[Models] Error:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar model" }, { status: 500 });
  }
}
