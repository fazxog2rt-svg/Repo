import { PrismaClient, PlanType } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    name: "Free",
    slug: "free",
    type: PlanType.FREE,
    description: "Mulai dengan model dasar",
    price: 0,
    currency: "IDR",
    period: "monthly",
    monthlyTokens: 10000,
    features: {
      "Akses model dasar": true,
      "10K token/bulan": true,
      "5 chat tersimpan": true,
      "1 AI Agent": true,
      "Upload file 5MB": true,
      "Prompt Library": true,
    },
    availableModels: ["openai/gpt-4o-mini", "google/gemini-2.0-flash"],
    maxChats: 5,
    maxAgents: 1,
    maxFileSize: 5,
    maxStorageGB: 0.1,
    isActive: true,
    sortOrder: 0,
  },
  {
    name: "Basic",
    slug: "basic",
    type: PlanType.BASIC,
    description: "Untuk pengguna individual",
    price: 49000,
    currency: "IDR",
    period: "monthly",
    monthlyTokens: 100000,
    features: {
      "100K token/bulan": true,
      "20+ model AI populer": true,
      "Chat tidak terbatas": true,
      "5 AI Agent": true,
      "Upload file 20MB": true,
      "AI Vision & OCR": true,
      "Workspace Markdown": true,
      "Email Support": true,
    },
    availableModels: ["openai/gpt-4o-mini", "openai/gpt-4o", "anthropic/claude-sonnet-4-6", "google/gemini-2.0-flash"],
    maxChats: -1,
    maxAgents: 5,
    maxFileSize: 20,
    maxStorageGB: 1,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Pro",
    slug: "pro",
    type: PlanType.PRO,
    description: "Untuk profesional & freelancer",
    price: 149000,
    currency: "IDR",
    period: "monthly",
    monthlyTokens: 500000,
    features: {
      "500K token/bulan": true,
      "50+ model AI premium": true,
      "Chat tidak terbatas": true,
      "20 AI Agent": true,
      "Upload file 50MB": true,
      "AI Image Generation": true,
      "Voice Chat & STT/TTS": true,
      "AI Workspace lengkap": true,
      "Export & Share Chat": true,
      "Priority Email Support": true,
    },
    availableModels: [],
    maxChats: -1,
    maxAgents: 20,
    maxFileSize: 50,
    maxStorageGB: 5,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Premium",
    slug: "premium",
    type: PlanType.PREMIUM,
    description: "Untuk tim & power users",
    price: 299000,
    currency: "IDR",
    period: "monthly",
    monthlyTokens: 2000000,
    features: {
      "2M token/bulan": true,
      "100+ model semua provider": true,
      "Chat tidak terbatas": true,
      "Unlimited AI Agent": true,
      "Upload file 200MB": true,
      "API Access": true,
      "WhatsApp Support": true,
      "Custom system prompt": true,
      "Analytics detail": true,
    },
    availableModels: [],
    maxChats: -1,
    maxAgents: -1,
    maxFileSize: 200,
    maxStorageGB: 20,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    type: PlanType.ENTERPRISE,
    description: "Solusi untuk perusahaan",
    price: 0,
    currency: "IDR",
    period: "custom",
    monthlyTokens: -1,
    features: {
      "Token tidak terbatas": true,
      "Dedicated instance": true,
      "Custom deployment": true,
      "SLA 99.9%": true,
      "Dedicated support": true,
      "Custom billing": true,
      "GDPR & compliance": true,
    },
    availableModels: [],
    maxChats: -1,
    maxAgents: -1,
    maxFileSize: 1000,
    maxStorageGB: 100,
    isActive: true,
    sortOrder: 4,
  },
];

const defaultPrompts = [
  {
    title: "Coding Assistant",
    content: "Anda adalah asisten coding yang ahli. Bantu saya dengan kode, jelaskan konsep, debug error, dan berikan solusi terbaik. Gunakan bahasa yang jelas dan berikan contoh kode yang bersih.",
    category: "Coding",
    description: "Asisten coding multi-bahasa pemrograman",
    tags: ["coding", "programming", "debug"],
    isPublic: true,
  },
  {
    title: "SEO Content Writer",
    content: "Anda adalah penulis konten SEO profesional. Buat konten yang dioptimasi untuk mesin pencari dengan keyword yang natural, heading yang tepat, dan konten yang memberikan nilai bagi pembaca.",
    category: "SEO",
    description: "Penulis konten yang dioptimasi SEO",
    tags: ["seo", "content", "writing"],
    isPublic: true,
  },
  {
    title: "Business Analyst",
    content: "Anda adalah analis bisnis berpengalaman. Bantu saya menganalisis situasi bisnis, membuat keputusan strategis, dan memberikan rekomendasi yang actionable berdasarkan data dan best practice.",
    category: "Business",
    description: "Analisis bisnis dan strategi",
    tags: ["business", "strategy", "analysis"],
    isPublic: true,
  },
  {
    title: "Email Professional",
    content: "Anda adalah pakar komunikasi profesional. Bantu saya menulis email yang efektif, formal, dan persuasif. Sesuaikan tone dengan konteks bisnis atau personal yang dibutuhkan.",
    category: "Productivity",
    description: "Penulisan email profesional",
    tags: ["email", "communication", "professional"],
    isPublic: true,
  },
  {
    title: "Python Developer",
    content: "Anda adalah developer Python senior yang ahli dalam Python modern, async programming, data science, dan best practices. Bantu saya dengan kode Python yang clean, efficient, dan well-documented.",
    category: "Coding",
    description: "Spesialis Python programming",
    tags: ["python", "programming", "data-science"],
    isPublic: true,
  },
  {
    title: "Marketing Copywriter",
    content: "Anda adalah copywriter marketing yang kreatif dan persuasif. Buat copy yang menarik, engaging, dan efektif untuk iklan, landing page, atau kampanye marketing.",
    category: "Marketing",
    description: "Copywriting marketing yang persuasif",
    tags: ["marketing", "copywriting", "ads"],
    isPublic: true,
  },
  {
    title: "SQL Expert",
    content: "Anda adalah expert database dan SQL. Bantu saya menulis query SQL yang optimal, desain schema database, dan optimasi performa. Support PostgreSQL, MySQL, SQLite, dan database lainnya.",
    category: "Coding",
    description: "Expert SQL dan database",
    tags: ["sql", "database", "query"],
    isPublic: true,
  },
  {
    title: "Research Assistant",
    content: "Anda adalah asisten penelitian yang teliti. Bantu saya melakukan riset mendalam, menganalisis informasi, menyusun laporan yang komprehensif, dan memberikan insight yang berharga.",
    category: "Research",
    description: "Asisten penelitian dan analisis",
    tags: ["research", "analysis", "report"],
    isPublic: true,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Seed plans
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log(`✅ Plan: ${plan.name}`);
  }

  // Seed default prompts
  for (const prompt of defaultPrompts) {
    const existing = await prisma.prompt.findFirst({
      where: { title: prompt.title, isPublic: true },
    });
    if (!existing) {
      await prisma.prompt.create({ data: prompt });
      console.log(`✅ Prompt: ${prompt.title}`);
    }
  }

  // System settings
  await prisma.systemSetting.upsert({
    where: { key: "payment_bank" },
    update: {},
    create: {
      key: "payment_bank",
      value: {
        bankName: "Bank Central Asia (BCA)",
        bankAccount: "1234567890",
        bankOwner: "PT Nexus AI Indonesia",
      },
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
