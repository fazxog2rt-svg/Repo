# NexusAI - Platform AI SaaS Premium

Platform AI SaaS premium dengan akses ke 100+ model AI dari OpenRouter. Dibangun dengan Next.js 15, React 19, TypeScript, Prisma, dan Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **State**: Zustand, TanStack Query
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Auth**: Auth.js v5 (NextAuth) - Google, GitHub, Discord, Email/Password
- **AI**: OpenRouter API (100+ model dari semua provider)
- **Cache**: Redis (ioredis)
- **WhatsApp**: Baileys
- **Infra**: Docker, Vercel-ready

## Fitur Utama

- ✅ AI Chat dengan streaming, markdown, LaTeX, Mermaid, syntax highlight
- ✅ AI Image, Vision, OCR, PDF Reader
- ✅ AI Voice (STT/TTS)
- ✅ AI Workspace (Notion-like)
- ✅ Prompt Library (100+ prompt siap pakai)
- ✅ AI Agents (buat AI custom)
- ✅ 100+ model AI (GPT-5, Claude, Gemini, DeepSeek, Llama, Grok, dll)
- ✅ Sistem subscription (Free, Basic, Pro, Premium, Enterprise)
- ✅ Pembayaran transfer bank manual + verifikasi WhatsApp bot
- ✅ Admin panel lengkap
- ✅ Enkripsi API Key dengan AES-256
- ✅ Rate limiting, RBAC, CSRF protection
- ✅ Dark/Light mode, Command Palette, Keyboard shortcuts
- ✅ Multi-language (Indonesia & English)

## Instalasi

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- OpenRouter Account (untuk API Key)

### 1. Clone & Install

```bash
git clone <repo-url>
cd nexus-ai
cp .env.example .env
npm install
```

### 2. Konfigurasi Environment

Edit `.env` dengan nilai yang sesuai:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nexusai"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
ENCRYPTION_KEY="your-32-char-encryption-key-here!!"
ENCRYPTION_IV="your-16-char-iv!!"

# OAuth (opsional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Bank untuk pembayaran
BANK_NAME="Bank Central Asia (BCA)"
BANK_ACCOUNT="1234567890"
BANK_OWNER="Nama Rekening"

# WhatsApp Bot
WA_BOT_PHONE="628xxxx"
WA_ADMIN_PHONE="628xxxx"
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Buat tabel
npm run prisma:push

# Seed data awal (plans, prompts)
npx ts-node --project tsconfig.server.json prisma/seed.ts
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka http://localhost:3000

### 5. Konfigurasi OpenRouter API Key

1. Daftar di [openrouter.ai](https://openrouter.ai)
2. Buat API Key di dashboard
3. Login ke NexusAI → Settings → API Settings
4. Masukkan API Key (tersimpan terenkripsi)

### 6. Setup WhatsApp Bot

```bash
# Jalankan bot (scan QR dengan WhatsApp)
npm run whatsapp
```

## Deployment

### Docker Compose

```bash
cp .env.example .env
# Edit .env sesuai production settings

docker-compose up -d

# Migrasi database
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx ts-node prisma/seed.ts
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables di Vercel dashboard.

> **Catatan**: WhatsApp Bot tidak bisa berjalan di Vercel (serverless). Deploy ke VPS atau gunakan Railway/Render untuk WhatsApp Bot.

## Struktur Folder

```
nexus-ai/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, Register, dll
│   ├── (dashboard)/       # Dashboard pages
│   ├── (landing)/         # Landing page
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/
│   ├── admin/             # Admin components
│   ├── chat/              # Chat components
│   ├── dashboard/         # Dashboard components
│   ├── landing/           # Landing page components
│   ├── layout/            # Layout components (sidebar, header)
│   ├── shared/            # Shared components
│   └── ui/                # UI primitives (button, input, dll)
├── lib/
│   ├── ai/               # OpenRouter integration
│   ├── auth/             # NextAuth config
│   ├── crypto/           # AES-256 encryption
│   ├── db/               # Prisma client
│   ├── email/            # Nodemailer
│   ├── redis/            # Redis client + cache helpers
│   └── utils/            # Utility functions
├── server/
│   └── whatsapp/         # Baileys WhatsApp Bot
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── types/                 # TypeScript types
├── stores/                # Zustand stores
└── hooks/                 # Custom React hooks
```

## Keamanan

- API Key OpenRouter dienkripsi dengan **AES-256** sebelum disimpan
- API Key **tidak pernah** dikirim ke frontend
- JWT + Secure Cookies untuk session
- Rate limiting dengan Redis
- RBAC (Role-Based Access Control)
- CSRF protection
- Input validation dengan Zod
- CSP headers
- SQL Injection protection (Prisma ORM)

## Lisensi

MIT License - lihat [LICENSE](LICENSE) untuk detail.
